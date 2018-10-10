import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";
import { LayerData } from "../../utils/LayerData";

class MiddleClickSelectModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__dirname);
    }

    onClick = (e: any) => {
        
        const objs = R20.getCurrentPageTokens();
        const cfg: any = this.getHook().config;

        if (e.button !== cfg.mouseButtonIndex) return;
        if(cfg.modAlt && !window.r20es.keys.altDown) return;
        if(cfg.modShift && !window.r20es.keys.shiftDown) return;
        if(cfg.modCtrl && !window.r20es.keys.ctrlDown) return;
        if(cfg.modMeta && !window.r20es.keys.metaDown) return;

        const canSelectBitmap = {
            [R20.CanvasLayer.GMTokens]: cfg.switchToGmLayer,
            [R20.CanvasLayer.PlayerTokens]: cfg.switchToTokenLayer,
            [R20.CanvasLayer.Map]: cfg.switchToMapLayer,
            [R20.CanvasLayer.Lighting]: cfg.switchToLightsLayer,
        };

        let idx = objs.length;

        while (idx-- > 0) {
            const obj = objs[idx];

            if (R20.doesTokenContainMouse(e, obj) && obj.model) {

                console.log("Found containing object:");
                console.log(obj);

                const layer = obj.model.get<R20.CanvasLayer>("layer");

                if(!canSelectBitmap[layer])  {
                    console.log("But not selecting due to it not being within the bitmap.");
                    continue;
                }

                if (R20.getCurrentLayer() !== layer) {
                    const selector = LayerData.getLayerData(layer).selector;
                    $(selector).trigger("click");
                }

                if (cfg.select) {
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
