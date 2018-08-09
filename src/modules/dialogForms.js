import { R20Bootstrapper } from "../tools/r20bootstrapper";
import { getBrowser } from "../tools/webExtHelpers";
import { createElement } from "../tools/createElement";

class DialogFormsBootstrapper extends R20Bootstrapper.Base {
    constructor() {
        super(__filename);
    }

    beforeInject() {
        const isFirefox = typeof InstallTrigger !== 'undefined';
        if (!isFirefox) return;

        const css = getBrowser().runtime.getURL("thirdparty/dialog-polyfill.css");
        const js = getBrowser().runtime.getURL("thirdparty/dialog-polyfill.js");

        createElement("link", {
            rel: "stylesheet",
            type: "text/css",
            href: css,
            onLoad: e => e.target.remove()
        }, null, document.head);



        createElement("script", {
            async: true,
            src: js,
            onLoad: e => e.target.remove()
        }, null, document.body);
    }
}

export {
    DialogFormsBootstrapper
}