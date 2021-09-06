import { R20Bootstrapper } from "../../utils/R20Bootstrapper";
import { findByIdAndRemove, getBrowser } from "../../utils/MiscUtils";

const JS_ID = "r20es-dialog-polyfill-js";
const STYLE_CSS = "r20es-dialog-style-css";
const POLYFILL_CSS = "r20es-dialo-gpolyfill-css";

class DialogFormsBootstrapper extends R20Bootstrapper.Base {
  constructor() {
    super(__dirname);
  }

  setup() {
    // @ts-ignore
    const isFirefox = typeof InstallTrigger !== 'undefined';

    if (isFirefox) {
      console.log("DialogFormsBootstrapper: injecting dialog-polyfill");

      this.injectScript(getBrowser().runtime.getURL("dialog-polyfill.js"), document.body, JS_ID, false);
      this.injectCSS(getBrowser().runtime.getURL("dialog-polyfill.css"), document.head, POLYFILL_CSS);
    }

    this.injectCSS(getBrowser().runtime.getURL("dialogBase.css"), document.head, STYLE_CSS);

    console.log("DialogFormsBootstrapper: done!");
  }

  disposePrevious() {
    findByIdAndRemove(POLYFILL_CSS);
    findByIdAndRemove(STYLE_CSS);
    findByIdAndRemove(JS_ID);
  }
}

export { DialogFormsBootstrapper}
