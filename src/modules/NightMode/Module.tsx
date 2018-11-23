import {R20Module} from '../../utils/R20Module'
import {findByIdAndRemove} from '../../utils/MiscUtils';
import {R20} from "../../utils/R20";
import {DOM} from "../../utils/DOM";

const css = require("./nightMode.scss");
const ogl5ecss = require("./5eOGLNightMode.scss");
const noSheetCss = require("./noCharacterSheetColor.scss");
const chatCss = require("./chatMessages.scss");

class DarkModeModule extends R20Module.OnAppLoadBase {
    private static readonly styleId = "r20es-dark-mode-style-id";
    private static readonly ogl5estyleId = "r20es-dark-mode-ogl-5e-style-id";
    private static readonly noSheetStyleId = "r20es-dark-mode-no-sheets-id";
    private static readonly chatStyleId = "r20es-dark-mode-chat-style-id";

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

    private addStyleWidget(style: string, id: string) {
        const widget = <style id={id}>{style}</style>;
        document.head.appendChild(widget);
    }

    private createWidget() {

        const cfg = this.getHook().config;

        if (cfg.baseStyle) {
            this.addStyleWidget(css, DarkModeModule.styleId);
        }

        if (cfg.styleChat) {
            this.addStyleWidget(chatCss, DarkModeModule.chatStyleId);
        }

        if (cfg.ogl5ESheet) {
            this.addStyleWidget(ogl5ecss, DarkModeModule.ogl5estyleId);
        } else {
            this.addStyleWidget(noSheetCss, DarkModeModule.noSheetStyleId);
        }

        this.updatePageBackground();
    }

    private removeWidget() {
        findByIdAndRemove(DarkModeModule.styleId);
        findByIdAndRemove(DarkModeModule.chatStyleId);
        findByIdAndRemove(DarkModeModule.ogl5estyleId);
        findByIdAndRemove(DarkModeModule.noSheetStyleId);
    }

    public onSettingChange(name, oldVal, newVal) {
        this.updatePageBackground();
        this.removeWidget();
        this.createWidget();
    }

    public setup() {
        this.createWidget();
        $(document).on("d20:pagechanged", this.onPageChanged);

        const cfg = this.getHook().config;
        if (cfg.baseStyle || cfg.styleChat || cfg.ogl5ESheet) {
            R20.saySystem(`
<h2 style="color: #c94a2a">Night Mode Deprecation</h2>
<span>Night Mode is being phased out in favor of <a <style="color: orange;" href="https://github.com/RedReign/Roll20-Dark-Theme">Red Reign's Dark Theme<a/></span>`
            );
        }
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
