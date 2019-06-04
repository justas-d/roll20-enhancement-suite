import {Config} from "../utils/Config";
import hooks from "../Configs";
import {injectScript, getBrowser, replaceAll, findByIdAndRemove} from "../utils/MiscUtils";
import SettingsBootstrapper from "../modules/Settings/Bootstrapper"
import {DialogFormsBootstrapper} from "../modules/Dialog/Bootstrapper";
import {LocalStorageBootstrapper} from "../modules/LocalStorage/Bootstrapper";
import {DOM} from "../utils/DOM";
import showProblemPopup from "../utils/ProblemPopup";
import {doesBrowserNotSupportResponseFiltering} from "../utils/BrowserDetection";
import {
    ELEMENT_ID_BOOTSTRAP_FLASH_WORKAROUND_STYLE,
    MESSAGE_KEY_CHROME_INJECTION_DONE,
    MESSAGE_KEY_DOM_LOADED,
    MESSAGE_KEY_LOAD_MODULES
} from "../MiscConstants";
import {getHooks, injectHooks} from "../HookUtils";

console.log("====================");
console.log("R20ES ContentScript");
console.log("====================");

window.bootstrapTable = {};
window.hasInjectedModules = false;

new DialogFormsBootstrapper().bootstrap();
new SettingsBootstrapper().bootstrap();
new LocalStorageBootstrapper().bootstrap();

injectScript("WebsiteBootstrap.js");

console.log("==============================================================");
console.log(window.bootstrapTable);

for (let id in window.bootstrapTable) {
    window.bootstrapTable[id].setup();
}

function injectModules() {

    if (window.hasInjectedModules) {
        return;
    }
    window.hasInjectedModules = true;

    try {
        console.log("ContentScript.js is injecting modules.");

        // inject modules
        for (let hookId in hooks) {
            const hook = hooks[hookId];

            if (!("filename" in hook)) continue;

            injectScript(hook.filename);
        }
    } catch (err) {
        console.error(err);
    }

    injectScript("WebsiteBootstrapAfter.js");
    window.bootstrapTable = undefined;

    console.log("ContentScript.js is done!");

    // @BootstrapFlashWorkaroundStyle
    findByIdAndRemove(ELEMENT_ID_BOOTSTRAP_FLASH_WORKAROUND_STYLE);
}

const recvMsgFromApp = (e) => {
    if (e.origin !== Config.appUrl) return;

    if (e.data.r20esWantsResourceUrl) {

        const url = getBrowser().extension.getURL(e.data.r20esWantsResourceUrl.resource);
        const payload = {
            url,
            id: e.data.r20esWantsResourceUrl.id
        };

        window.postMessage({r20esGivesResourceUrl: payload}, Config.appUrl);
    } else {
        console.log(e.data);

        if (doesBrowserNotSupportResponseFiltering()) {

            if (e.data[MESSAGE_KEY_LOAD_MODULES]) {
                window.injectWebsiteOK = true;
            }

            if (e.data[MESSAGE_KEY_CHROME_INJECTION_DONE]) {
                window.injectBackgroundOK = true;
            }

            if (window.injectBackgroundOK && window.injectWebsiteOK) {
                injectModules();
            }

        } else {
            if (e.data[MESSAGE_KEY_LOAD_MODULES]) {
                injectModules();
            }
        }
    }
};

window.addEventListener("message", recvMsgFromApp);

console.log("ContentScript.js is waiting for an OK from WebsiteBootstrap.js to inject modules.");

setTimeout(() => {

    if (window.hasInjectedModules) return;

    showProblemPopup(
        <div>
            {`window.hasInjectedModules: ${typeof (window.hasInjectedModules)} ${window.hasInjectedModules}`}<br/>
            {`window.injectWebsiteOK: ${typeof (window.injectWebsiteOK)} ${window.injectWebsiteOK}`}<br/>
            {`window.injectBackgroundOK: ${typeof (window.injectBackgroundOK)} ${window.injectBackgroundOK}`}<br/>
            {`window.bootstrapTable: ${typeof (window.bootstrapTable)} ${window.bootstrapTable}`}<br/>
        </div>
    );

}, 20 * 1000);

if(doesBrowserNotSupportResponseFiltering()) {

    const hookedScriptQueue = {};
    let numScriptsDone = 0;

    const waitForDepts = () => {
        if(document.readyState !== "complete") {
            setTimeout(waitForDepts, 10);
            return;
        }

        console.log("DOM LOADED, requesting redirectQueue.");

        getBrowser().runtime.sendMessage({
            [MESSAGE_KEY_DOM_LOADED]: true,
        }, (redirectQueue) => {
            console.log("Received redirectQueue from background:", redirectQueue);

            for(let urlIndex = 0;
                    urlIndex < redirectQueue.length;
                    urlIndex++)
            {
                const url = redirectQueue[urlIndex];
                const response = fetch(url);

                response.then(response => {

                    const textPromise = response.text();

                    textPromise.then(originalScriptSource => {
                        {
                            let hookedData = originalScriptSource;
                            // take over jquery .ready
                            hookedData = hookedData.replace(
                                "jQuery.ready.promise().done( fn );",
                                `if(!window.r20esChrome) window.r20esChrome = {};
                                 if(!window.r20esChrome.readyCallbacks) window.r20esChrome.readyCallbacks = [];
                                window.r20esChrome.readyCallbacks.push(fn);`);

                            // incredibly long loading screens fix
                            hookedData = hookedData.replace(
                                `},6e4))`,
                                `},250))`);

                            const hookQueue = getHooks(hooks, url);
                            hookedData = injectHooks(hookedData, hookQueue, replaceAll);

                            const blob = new Blob([hookedData]);
                            const hookedScriptUrl = URL.createObjectURL(blob);
                            const scriptElement = document.createElement("script");

                            scriptElement.async = false;
                            scriptElement.src = hookedScriptUrl;
                            scriptElement.id = url;

                            hookedScriptQueue[urlIndex] = scriptElement;
                        }

                        numScriptsDone++;


                        if(numScriptsDone === redirectQueue.length) {

                            /*
                                NOTE(justas);
                                for some reason, when we call document.body.appendChild(scriptElement);
                                the screen flashes white because the styles get all messed up.
                                This style change bodges a workaround by making the background black,
                                thus the flash becomes subtle.
                                @BootstrapFlashWorkaroundStyle
                             */
                            {
                                const style = document.createElement("style");
                                style.innerHTML = "body { background: black !important; }";
                                style.id = ELEMENT_ID_BOOTSTRAP_FLASH_WORKAROUND_STYLE;
                                document.head.appendChild(style);
                            }

                            console.log("Scripts are done, dumping", hookedScriptQueue);

                            for(const indexKey in hookedScriptQueue) {
                                const scriptElement = hookedScriptQueue[indexKey];

                                console.log("Injecting ", scriptElement);
                                document.body.appendChild(scriptElement);
                            }

                            injectScript("ChromePostInjectScriptsPayload.js");
                        }
                    });

                    textPromise.catch(e => {
                        console.error("FATAL: textPromise of redirectQueue fetch failed: ", url, e);
                    })
                });

                response.catch(e => {
                    console.error("FATAL: fetch redirectQueue promise failed: ", url, e);
                })
            }
        });
    };

    waitForDepts();
}
