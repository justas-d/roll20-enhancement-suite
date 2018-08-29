import { R20Module } from "../../tools/R20Module"
import { findByIdAndRemove, createCSSElement } from "../../tools/MiscUtils";

class TransparentPaperModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__dirname);

        this.styleId = "r20es-transparent-paper-style";
    }

    removeStyle() {
        findByIdAndRemove(this.styleId);
    }

    injectStyle() {
        const cfg = this.getHook().config;

        const el = createCSSElement(`.ui-dialog { opacity: ${cfg.opacity}; }`, this.styleId);
        document.body.appendChild(el);
    }

    onSettingChange(name, oldVal, newVal) {
        this.removeStyle();
        this.injectStyle();
    }

    setup() { 
        this.injectStyle();
    }

    dispose() { 
        this.removeStyle();
        super.dispose();
    }
}

if (R20Module.canInstall()) new TransparentPaperModule().install();
