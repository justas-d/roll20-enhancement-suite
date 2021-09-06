import { R20Bootstrapper } from "../../utils/R20Bootstrapper";
import { getBrowser, findByIdAndRemove } from "../../utils/MiscUtils";

const CSS_ID = "r20es-settings-css";

class SettingsBootstrapper extends R20Bootstrapper.Base {
  constructor() {
    super(__dirname);
  }

  setup() {
    this.injectCSS(getBrowser().runtime.getURL("settings.css"), document.head, CSS_ID);
  }

  disposePrevious() {
    findByIdAndRemove(CSS_ID);
  }
}

export default SettingsBootstrapper;
