import { R20Module } from "../../utils/R20Module"
import { findByIdAndRemove, createCSSElement } from "../../utils/MiscUtils";

class TransparentPaperModule extends R20Module.OnAppLoadBase {
    private static readonly styleId = "r20es-transparent-paper-style";

    constructor() {
        super(__dirname);
    }

    private static removeStyle() {
        findByIdAndRemove(TransparentPaperModule.styleId);
    }

    private injectStyle() {
        const cfg = this.getHook().config;

        const el = createCSSElement(`.ui-dialog { opacity: ${cfg.opacity}; }`, TransparentPaperModule.styleId);
        document.body.appendChild(el);
    }

    protected onSettingChange(name: string, oldVal: any, newVal: any) {
        TransparentPaperModule.removeStyle();
        this.injectStyle();
    }

    public setup() {
        this.injectStyle();
    }

    public dispose() {
        TransparentPaperModule.removeStyle();
        super.dispose();
    }
}

export default () => {
  new TransparentPaperModule().install();
};

