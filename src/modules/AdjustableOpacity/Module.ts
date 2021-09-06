import {R20Module} from "../../utils/R20Module"
import {ADJUSTABLE_OPACITY_PASSIVE_GM_LAYER_CONFIG_KEY} from "./Constants";
import {R20} from "../../utils/R20";

class AdjustableOpacityModule extends R20Module.OnAppLoadBase {

    constructor() {
        super(__dirname);
    }

    private static exposeOpacity(val: number) {
        R20.setGMLayerOpacity(val);
    }

    private onSettingChange(name: string, oldVal: any, newVal: any) {
        if (name === ADJUSTABLE_OPACITY_PASSIVE_GM_LAYER_CONFIG_KEY) {
            AdjustableOpacityModule.exposeOpacity(newVal);
            R20.renderAll();
        }
    }

    public setup() {
        const cfg = this.getHook().config;
        AdjustableOpacityModule.exposeOpacity(cfg[ADJUSTABLE_OPACITY_PASSIVE_GM_LAYER_CONFIG_KEY]);
        R20.renderAll();
    }

    public dispose() {
        super.dispose();
        delete window.r20es[ADJUSTABLE_OPACITY_PASSIVE_GM_LAYER_CONFIG_KEY];
        R20.renderAll();
    }
}

export default () => {
  new AdjustableOpacityModule().install();
};

