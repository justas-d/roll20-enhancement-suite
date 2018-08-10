import { R20Bootstrapper } from "../tools/r20bootstrapper";
import { getBrowser } from "../tools/webExtHelpers";
import { findByIdAndRemove } from "../tools/miscUtil";

class DialogFormsBootstrapper extends R20Bootstrapper.Base {
    constructor() {
        super(__filename);
        this.cssId = "r20esdialogpolyfillcss";
        this.jsId = "r20esdialogpolyfilljs";
    }

    setup() {

        console.log("before inject");
        
        const isFirefox = typeof InstallTrigger !== 'undefined';
        if (!isFirefox) return;

        console.log("DialogFormsBootstrapper: injecting dialog-polyfill");

        const css = getBrowser().runtime.getURL("thirdparty/dialog-polyfill.css");
        const js = getBrowser().runtime.getURL("thirdparty/dialog-polyfill.js");

        this.injectCSS(css, document.head, this.cssId);
        this.injectScript(js, document.body, this.jsId, false);

        console.log("DialogFormsBootstrapper: done!");
    }

    disposePrevious() {
        findByIdAndRemove(this.cssId);
        findByIdAndRemove(this.jsId);
    }
}

export {
    DialogFormsBootstrapper
}