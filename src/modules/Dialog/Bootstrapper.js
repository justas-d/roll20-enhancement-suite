import { R20Bootstrapper } from "../../utils/R20Bootstrapper";
import { findByIdAndRemove, getBrowser } from "../../utils/MiscUtils";


class DialogFormsBootstrapper extends R20Bootstrapper.Base {
    constructor() {
        super(__dirname);

        this.polyfillCss = "r20es-dialo-gpolyfill-css";
        this.styleCss = "r20es-dialog-style-css";
        this.jsId = "r20es-dialog-polyfill-js";
    }

    setup() {
        const isFirefox = typeof InstallTrigger !== 'undefined';
        if (isFirefox) {
            console.log("DialogFormsBootstrapper: injecting dialog-polyfill");

            this.injectScript(getBrowser().runtime.getURL("dialog-polyfill.js"), document.body, this.jsId, false);
            this.injectCSS(getBrowser().runtime.getURL("dialog-polyfill.css"), document.head, this.polyfillCss);
        }

        this.injectCSS(getBrowser().runtime.getURL("dialogBase.css"), document.head, this.styleCss);

        console.log("DialogFormsBootstrapper: done!");
    }

    disposePrevious() {
        findByIdAndRemove(this.polyfillCss);
        findByIdAndRemove(this.styleCss);
        findByIdAndRemove(this.jsId);
    }
}

export { DialogFormsBootstrapper}
