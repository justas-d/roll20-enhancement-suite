import { R20Bootstrapper } from "../../tools/R20Bootstrapper";
import { getBrowser, findByIdAndRemove } from "../../tools/MiscUtils";

class SettingsBootstrapper extends R20Bootstrapper.Base {
    constructor() {
        super(__dirname);
        this.cssId = "r20es-settings-css";
    }

    setup() {
        this.injectCSS(getBrowser().runtime.getURL("settings.css"), document.head, this.cssId);
    }

    disposePrevious() {
        findByIdAndRemove(this.cssId);
    }
}

export default SettingsBootstrapper;
