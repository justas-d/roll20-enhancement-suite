import {R20Module} from '../../tools/R20Module'
import {DOM} from '../../tools/DOM';
import {findByIdAndRemove} from '../../tools/MiscUtils';
import {R20} from "../../tools/R20";

const css = require("./nightMode.scss");

class DarkModeModule extends R20Module.OnAppLoadBase {
    private static readonly styleId = "r20es-dark-mode-style-id";

    constructor() {
        super(__dirname);
    }

    private onPageChanged = () => {
        this.updatePageBackground();
    };

    private updatePageBackground() {
        const cfg = this.getHook().config;

        if (cfg.overrideBackground) {
            R20.setBackgroundStyle("#0d0e0f");
        } else {
            this.resetPageBackground();
        }

        R20.renderAll();
    }

    private resetPageBackground() {
        const page = R20.getCurrentPage();
        R20.setBackgroundStyle(page.attributes.background_color);
    }

    private createWidget() {
        this.updatePageBackground();
        const widget = <style id={DarkModeModule.styleId}>{css}</style>;
        document.head.appendChild(widget);
    }

    private removeWidget() {
        findByIdAndRemove(DarkModeModule.styleId);
    }

    public onSettingChange(name, oldVal, newVal) {
        this.updatePageBackground();
        this.removeWidget();
        this.createWidget();
    }

    public setup() {
        this.createWidget();
        $(document).on("d20:pagechanged", this.onPageChanged);

    }

    public dispose() {
        super.dispose();
        $(document).off("d20:pagechanged", this.onPageChanged);
        this.removeWidget();

        this.resetPageBackground();
        R20.renderAll();
    }
}

if (R20Module.canInstall()) new DarkModeModule().install();
