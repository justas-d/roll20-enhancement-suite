import { R20Module } from '../tools/R20Module'
import { R20 } from '../tools/R20';
import { LayerData } from '../tools/LayerData';
import { DOM } from '../tools/DOM.js';
import { copy, findByIdAndRemove } from '../tools/MiscUtils.js';

class DrawCurrentLayerModule extends R20Module.OnAppLoadBase {
    private static readonly selectId = "r20es-select";
    private static readonly layerId = "r20es-layer";
    private static readonly rootId = "r20es-drawCurrentLayer-root";

    constructor() {
        super(__filename);
    }

    private createWidget() {

        const root = document.getElementById("playerzone");
        if (!root) return;

        const cfg = this.getHook().config;

        const padCoef = 9.375;
        const bottomPadCoef = 3.75;
        const pad = `${cfg.size / padCoef}px`; document

        const divStyle = {
            height: `${cfg.size}px`,
            padding: `${pad} ${pad} ${cfg.size / bottomPadCoef}px ${pad}`,
        }

        const textStyle = {
            fontFamily: "Helvetica",
            fontSize: `${cfg.size}px`,
            //lineHeight: "0.67em",
            lineHeight: "1em",
            color: `rgba(${cfg.textFillColor[0]}, ${cfg.textFillColor[1]}, ${cfg.textFillColor[2]}, ${cfg.textFillOpacity})`,
            textShadow: `2px 2px 0px rgba(${cfg.textOutlineColor[0]}, ${cfg.textOutlineColor[1]}, ${cfg.textOutlineColor[2]}, ${cfg.textOutlineOpacity})`
        }

        let rootStyle: any = {
            opacity: cfg.globalOpacity,
            marginBottom: "15px",
            marginRight: "15px",
            position: "absolute",
        };

        switch (cfg.corner) {
            case ("bottomRight"): {
                rootStyle.bottom = "0";
                rootStyle.right = "0";
                break;
            } case ("bottomLeft"): {
                rootStyle.bottom = "0";
                rootStyle.left = "0";
                break;
            } case ("topRight"): {
                rootStyle.top = "0";
                rootStyle.right = "0";
                break;
            } case ("topLeft"): {
                rootStyle.top = "0";
                rootStyle.left = "0";
                break;
            } default: {
                console.error(`Unknown DCL module corner: ${cfg.corner}`);
            }
        }

        const widget = <div id={DrawCurrentLayerModule.rootId} style={rootStyle}>

            {cfg.showNotSelecting &&
                <div id={DrawCurrentLayerModule.selectId} style={copy(divStyle, { background: `rgba(255,0,0,${cfg.notSelectingOpacity})` })}>
                    <p style={textStyle}>Not selecting!</p>
                </div>
            }

            <div id={DrawCurrentLayerModule.layerId} style={divStyle}>
                <p style={textStyle}></p>
            </div>
        </div>

        root.appendChild(widget);


        this.render(R20.getCurrentLayer());
        this.updateModeIndicator(R20.getCurrentToolName());
    }

    private removeWidget() {
        findByIdAndRemove(DrawCurrentLayerModule.rootId);
    }

    onSettingChange(name, oldVal, newVal) {
        this.removeWidget();
        this.createWidget();
    }

    setup() {
        if (!R20.isGM) return;

        this.createWidget();

        $("#editinglayer li.chooseobjects").on("click", this.onToolChange);
        $("#editinglayer li.choosemap").on("click", this.onToolChange);
        $("#editinglayer li.choosegmlayer").on("click", this.onToolChange);

        window.r20es.setModePrologue = this.updateModeIndicator;
    }

    private onToolChange = (e) => {
        let l = null;

        if (e.target.className === "choosegmlayer") { l = "gmlayer"; }
        else if (e.target.className === "choosemap") { l = "map"; }
        else if (e.target.className === "chooseobjects") { l = "objects"; }

        this.render(l);
    }

    private updateModeIndicator = (mode: string) => {
        const div = document.getElementById(DrawCurrentLayerModule.selectId);
        if (!div) return;

        div.style.display = (mode === "select" ? "none" : "block");
    }

    private render = (layer: R20.CanvasLayer) => {
        const data = LayerData.getLayerData(layer);
        const div = document.getElementById(DrawCurrentLayerModule.layerId);
        const text = $(div).find("p")[0];

        div.style.backgroundColor = data.makeBgStyle(this.getHook().config.backgroundOpacity);
        text.innerHTML = data.bigTxt;
    }

    dispose() {
        super.dispose();

        $("#editinglayer li.chooseobjects").off("click", this.onToolChange);
        $("#editinglayer li.choosemap").off("click", this.onToolChange);
        $("#editinglayer li.choosegmlayer").off("click", this.onToolChange);

        window.r20es.setModePrologue = null;
        this.removeWidget();

    }
}

if (R20Module.canInstall()) new DrawCurrentLayerModule().install();

const hook = R20Module.makeHook(__filename, {
    id: "activeLayerHud",
    name: "Display active layer",
    description: "Displays the active edit layer as well as whether the select tool is active.",
    category: R20Module.category.canvas,
    gmOnly: true,

    configView: {
        size: {
            type: "number",
            display: "Size"
        },
        globalOpacity: {
            type: "slider",
            display: "Global opacity",
            sliderMin: 0,
            sliderMax: 1,
        },
        showNotSelecting: {
            type: "checkbox",
            display: "Show \"Not selecting!\" when the current tool is not the select tool?"
        },
        notSelectingOpacity: {
            type: "slider",
            display: "\"Not selecting\" box opacity",
            sliderMin: 0,
            sliderMax: 1,
        },
        backgroundOpacity: {
            type: "slider",
            display: "Background opacity",
            sliderMin: 0,
            sliderMax: 1,
        },

        textFillOpacity: {
            type: "slider",
            display: "Text shadow opacity",
            sliderMin: 0,
            sliderMax: 1,
        },

        textFillColor: {
            type: "color",
            display: "Text shadow color"
        },

        textOutlineOpacity: {
            type: "slider",
            display: "Text outline opacity",

            sliderMin: 0,
            sliderMax: 1,
        },

        textOutlineColor: {
            type: "color",
            display: "Text outline color"
        },

        corner: {
            type: "dropdown",
            display: "Position",

            dropdownValues: {
                bottomRight: "Bottom Right",
                bottomLeft: "Bottom Left",
                topRight: "Top Right",
                topLeft: "Top Left"
            }
        }

    },

    config: {
        size: 26,
        showNotSelecting: true,
        notSelectingOpacity: 1,
        globalOpacity: 1,
        backgroundOpacity: 1,
        textFillOpacity: 1,
        textFillColor: [255, 255, 255],
        textOutlineOpacity: 1,
        textOutlineColor: [0, 0, 0],
        corner: "bottomRight"
    },

    includes: "assets/app.js",
    find: "function setMode(e){",
    patch: "function setMode(e){if(window.r20es && window.r20es.setModePrologue) {window.r20es.setModePrologue(e);}",

});

export { hook as DrawCurrentLayerHook };
