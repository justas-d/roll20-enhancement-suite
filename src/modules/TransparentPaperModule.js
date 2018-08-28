import { R20Module } from "../tools/R20Module"
import { findByIdAndRemove, createCSSElement } from "../tools/MiscUtils";

class TransparentPaperModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__filename);

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

const hook = R20Module.makeHook(__filename, {
    id: "transparentPaperDivs",
    name: "Transparent Canvas UI Dialogs",
    description: "Provides a way to set the opacity of floating UI dialogs.",
    category: R20Module.category.canvas,
    media: {
        "transparent_dialog.png": "A transparent edit token dialog."
    },

    configView: {
        opacity: {
            display: "Opacity",
            type: "slider",

            sliderMin: 0,
            sliderMax: 1,
        },
    },

    config: {
        opacity: 1,
    },
});

export { hook as TransparentPaperModuleHook}
