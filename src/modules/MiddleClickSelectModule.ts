import { R20Module } from "../tools/R20Module";
import { R20 } from "../tools/R20";
import {LayerData } from "../tools/LayerData";

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
                let layer = obj.model.get<R20.CanvasLayer>("layer");

                if (R20.getCurrentLayer() !== layer) {

                    const selector = LayerData.getLayerData(layer).selector;
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
        
        document.addEventListener("mouseup", this.onClick);
    }

    dispose() {
        super.dispose();
        document.removeEventListener("mouseup", this.onClick);
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
