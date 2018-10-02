import {R20Module} from '../../tools/R20Module'
import {R20} from '../../tools/R20';
import {LayerData} from '../../tools/LayerData';
import {DOM} from '../../tools/DOM';
import {copy, findByIdAndRemove} from '../../tools/MiscUtils';

enum ToolClasses {
    GMTokens = "choosegmlayer",
    Map = "choosemap",
    PlayerTokens = "chooseobjects",
    Lighting = "choosewalls",
}

class DrawCurrentLayerModule extends R20Module.OnAppLoadBase {
    private static readonly selectId = "r20es-select";
    private static readonly layerId = "r20es-layer";
    private static readonly rootId = "r20es-drawCurrentLayer-root";

    constructor() {
        super(__dirname);
    }

    private createWidget() {
        console.log("Creating widget");

        const root = document.getElementById("playerzone");
        console.log(root);

        if (!root) return;

        const cfg = this.getHook().config;

        const padCoef = 9.375;
        const bottomPadCoef = 3.75;
        const pad = `${cfg.size / padCoef}px`;

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
            }
            case ("bottomLeft"): {
                rootStyle.bottom = "0";
                rootStyle.left = "0";
                break;
            }
            case ("topRight"): {
                rootStyle.top = "0";
                rootStyle.right = "0";
                break;
            }
            case ("topLeft"): {
                rootStyle.top = "0";
                rootStyle.left = "0";
                break;
            }
            default: {
                console.error(`Unknown DCL module corner: ${cfg.corner}`);
            }
        }

        const widget = <div id={DrawCurrentLayerModule.rootId} style={rootStyle}>

            {cfg.showNotSelecting &&
            <div id={DrawCurrentLayerModule.selectId}
                 style={copy(divStyle, {background: `rgba(255,0,0,${cfg.notSelectingOpacity})`})}>
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

    public onSettingChange(name, oldVal, newVal) {
        this.removeWidget();
        this.createWidget();
    }

    public setup() {
        if (!R20.isGM) return;

        this.createWidget();

        const getButton = (className: string) => $(`#editinglayer li.${className}`);

        const hookListeners = (button: JQuery) => {
            // @ts-ignore
            button.off("click", this.onToolChange);
            button.on("click", this.onToolChange);
        };

        for (const item in ToolClasses) {
            const btn = getButton(ToolClasses[item]);
            hookListeners(btn);
        }

        window.r20es.setModePrologue = this.updateModeIndicator;

        // Note(Justas): betteR20 only adds the dynamic lighting button a bit later after setup is called
        // which means we've got to wait a while.
        if(getButton(ToolClasses.Lighting).length <= 0) {
            setTimeout(() => {
                hookListeners(getButton(ToolClasses.Lighting));
            }, 10000);
        }
    }

    private onToolChange = (e: Event) => {
        const target = e.target as HTMLElement;

        const map = {
            [ToolClasses.GMTokens]: R20.CanvasLayer.GMTokens,
            [ToolClasses.Map]: R20.CanvasLayer.Map,
            [ToolClasses.PlayerTokens]: R20.CanvasLayer.PlayerTokens,
            [ToolClasses.Lighting]: R20.CanvasLayer.Lighting,
        };

        for (const key in map) {
            if (!target.classList.contains(key)) continue;
            this.render(map[key]);
            break;
        }
    };

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

    public dispose() {
        super.dispose();

        for(const item in ToolClasses) {
            // @ts-ignore
            $(`#editinglayer li.${ToolClasses[item]}`).off("click", this.onToolChange);
        }

        window.r20es.setModePrologue = null;
        this.removeWidget();

    }
}

if (R20Module.canInstall()) new DrawCurrentLayerModule().install();
