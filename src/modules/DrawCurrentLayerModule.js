import { R20Module } from '../tools/R20Module'
import { R20 } from '../tools/R20.js';
import { getLayerData } from '../tools/LayerData.js';
import { DOM } from '../tools/DOM.js';
import { copy, findByIdAndRemove } from '../tools/MiscUtils.js';

class DrawCurrentLayerModule extends R20Module.OnAppLoadBase {
    constructor(id) {
        super(id);

        this.selectId = "r20es-select";
        this.layerId = "r20es-layer";
        this.rootId = "r20es-drawCurrentLayer-root";

        this.onToolChange = this.onToolChange.bind(this);
        this.updateModeIndicator = this.updateModeIndicator.bind(this);
    }

    setup() {
        if (!R20.isGM) return;

        const divStyle = {
            padding: "4px",
            height: "30px",
        }

        const textStyle = {
            fontFamily: "Helvetica",
            fontSize: "26px",
            display: "inline-block",
            verticalAlign: "middle",
            margin: "0px",
            lineHeight: divStyle.height
        }

        const widget = <div id={this.rootId} style={{
            marginBottom: "15px",
            marginRight: "15px",
            width: "auto",
            maxWidth: "100%",
            overflowX: "hidden",
            position: "absolute",
            bottom: "0",
            right: "0",
            backgroundClip: "border-box"
        }}>
            <div id={this.selectId} style={copy(divStyle, { background: "rgba(255,0,0,0.5)" })}>
                <p style={textStyle}>Not selecting!</p>
            </div>

            <div id={this.layerId} style={divStyle}>
                <p style={textStyle}></p>
            </div>
        </div>

        const root = document.getElementById("playerzone");
        if(!root) return;

        root.appendChild(widget);

        $("#editinglayer li.chooseobjects").on("click", this.onToolChange);
        $("#editinglayer li.choosemap").on("click", this.onToolChange);
        $("#editinglayer li.choosegmlayer").on("click", this.onToolChange);

        window.r20es.setModePrologue = this.updateModeIndicator;

        this.render(R20.getCurrentLayer());
        this.updateModeIndicator(R20.getCurrentToolName());
    }

    onToolChange(e) {
        let l = null;

        if (e.target.className === "choosegmlayer") { l = "gmlayer"; }
        else if (e.target.className === "choosemap") { l = "map"; }
        else if (e.target.className === "chooseobjects") { l = "objects"; }

        this.render(l);
    }

    updateModeIndicator(mode) {
        const div = $(`#${this.selectId}`)[0];
        div.style.display = (mode === "select" ? "none" : "block");
    }

    render(layer) {
        const data = getLayerData(layer);
        const div = $(`#${this.layerId}`)[0];
        const text = $(div).find("p")[0];

        div.style.backgroundColor = data.bg;
        text.innerHTML = data.bigTxt;
    }

    dispose() {
        $("#editinglayer li.chooseobjects").off("click", this.onToolChange);
        $("#editinglayer li.choosemap").off("click", this.onToolChange);
        $("#editinglayer li.choosegmlayer").off("click", this.onToolChange);

        window.r20es.setModePrologue = null;
        findByIdAndRemove(this.rootId);
    }
}

if (R20Module.canInstall()) new DrawCurrentLayerModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "activeLayerHud",
    name: "Display active layer",
    description: "Displays the active edit layer as well as whether the select tool is active.",
    category: R20Module.category.canvas,
    gmOnly: true,

    includes: "assets/app.js",
    find: "function setMode(e){",
    patch: "function setMode(e){if(window.r20es && window.r20es.setModePrologue) {window.r20es.setModePrologue(e);}",

});

export { hook as DrawCurrentLayerHook };
