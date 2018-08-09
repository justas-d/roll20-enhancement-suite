import { R20Bootstrapper } from "../tools/r20bootstrapper";
import { getBrowser } from "../tools/webExtHelpers";
import { createElement } from "../tools/createElement";
import { removeAllChildren } from "../tools/miscUtil";

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

        createElement("link", {
            rel: "stylesheet",
            id: this.cssId,
            type: "text/css",
            href: css,
        }, null, document.head);



        createElement("script", {
            async: false,
            src: js,
            id: this.jsId
        }, null, document.body);

        console.log("DialogFormsBootstrapper: done!");
    }

    disposePrevious() {
        removeAllChildren(this.cssId);
        removeAllChildren(this.jsId);
    }
}

export {
    DialogFormsBootstrapper
}