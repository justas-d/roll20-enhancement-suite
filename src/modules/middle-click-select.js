import { R20Module } from "../tools/r20Module";
import { R20 } from "../tools/r20api";
import { getLayerData } from "../tools/layerData";

class MiddleClickSelectModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__filename);
        this.onClick = this.onClick.bind(this);
    }

    onClick(e) {
        if (e.button !== 1) return;

        const objs = R20.getCurrentPageTokens();
        let idx = objs.length;

        while (idx-- > 0) {
            const obj = objs[idx];

            if (R20.doesTokenContainMouse(e, obj) && obj.model) {
                let layer = obj.model.get("layer");

                if (R20.getCurrentLayer() !== layer) {

                    const selector = getLayerData(layer).selector;
                    $(selector).trigger("click");
                }

                if (this.getHook().config.select) {
                    R20.selectToken(obj);
                }

                break;
            }
        }
    }

    setup() {
        if (!R20.isGM()) return;
        console.log("setup listener");

        document.addEventListener("click", this.onClick);
    }

    dispose() {
        document.removeEventListener("click", this.onClick);
    }
}

if (R20Module.canInstall()) new MiddleClickSelectModule().install();

const hook = R20Module.makeHook(__filename,{
    id: "middleClickToTokenLayer",
    name: "Middle click to switch to token layer.",
    description: "When middle clicking (scroll wheel), will set the current layer to the layer of the token underneath the mouse.",
    category: R20Module.category.canvas,
    gmOnly: true,

    configView: {
        select: {
            display: "Also select token",
            type: "checkbox"
        }
    },

    config: {
        select: false,
    }
});

export { hook as MiddleClickSelectHook }