import {R20Module} from '../../utils/R20Module'
import {R20} from "../../utils/R20";
import {DOM} from "../../utils/DOM";

class DarkModeModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__dirname);
    }

    private onPageChanged = () => {
        this.updatePageBackground();
    };

    private updatePageBackground() {
        const cfg = this.getHook().config;

        const color = cfg.backgroundColor;
        const colorString = `rgba(${color[0]}, ${color[1]}, ${color[2]})`;

        R20.setBackgroundStyle(colorString);
        R20.renderAll();
    }

    private resetPageBackground() {
        const page = R20.getCurrentPage();
        R20.setBackgroundStyle(page.attributes.background_color);
    }

    public onSettingChange(name, oldVal, newVal) {
        this.updatePageBackground();
    }

    public setup() {

        $(document).on("d20:pagechanged", this.onPageChanged);

        setTimeout(() => {
            this.updatePageBackground();
        }, 500);
    }

    public dispose() {
        super.dispose();
        $(document).off("d20:pagechanged", this.onPageChanged);

        this.resetPageBackground();
        R20.renderAll();
    }
}

if (R20Module.canInstall()) new DarkModeModule().install();
