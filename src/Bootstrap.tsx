import { VTTES_MODULE_CONFIGS } from "./Configs";
import { VTTES_MODULES }from "./Modules";
import { Config } from "./utils/Config";
import { safeCall, findByIdAndRemove } from "./utils/MiscUtils";
import showProblemPopup from "./utils/ProblemPopup";
import { DOM } from "./utils/DOM";
import {EventEmitter} from "./utils/EventEmitter";
import { saveAs } from 'save-as'
import {isChromium} from "./utils/BrowserDetection";
import {getHooks, injectHooks} from './HookUtils';
import {getBrowser} from "./utils/MiscUtils";
import {
  ELEMENT_ID_BOOTSTRAP_FLASH_WORKAROUND_STYLE,
  MESSAGE_KEY_LOAD_MODULES,
  MESSAGE_KEY_INJECT_MODULES
} from "./MiscConstants";

import { dialog_polyfill_script, dialog_polyfill_css } from "./dialog_polyfill";

const USERSCRIPT_SAVE_DATA_KEY = "vttes_userscript_config";

export const bootstrap = () => {

  window.hasInjectedModules = false;

  setTimeout(() => {
    if(typeof (window.d20) !== "undefined" && 
       typeof (window.r20es) !== "undefined" &&
       window.hasInjectedModules
    ) {
      return;
    }

    if(BUILD_CONSTANT_IS_FOR_USERSCRIPT) {
      showProblemPopup(
        <div>
          {`window.d20: ${typeof (window.d20)} ${window.d20}`}<br />
          {`window.r20es: ${typeof (window.r20es)} ${window.r20es}`}<br />
          {`window.hasInjectedModules: ${typeof (window.hasInjectedModules)} ${window.hasInjectedModules}`}<br/>
          {"Is userscript!"}<br/>
        </div>
      );
    }
    else {
      showProblemPopup(
        <div>
          {`window.d20: ${typeof (window.d20)} ${window.d20}`}<br />
          {`window.r20es: ${typeof (window.r20es)} ${window.r20es}`}<br />
          {`window.hasInjectedModules: ${typeof (window.hasInjectedModules)} ${window.hasInjectedModules}`}<br/>
          {`window.injectWebsiteOK: ${typeof (window.injectWebsiteOK)} ${window.injectWebsiteOK}`}<br/>
          {`window.injectBackgroundOK: ${typeof (window.injectBackgroundOK)} ${window.injectBackgroundOK}`}<br/>

        </div>
      );
    }
  }, 25 * 1000);

  if(BUILD_CONSTANT_IS_FOR_USERSCRIPT) {
    window.enhancementSuiteEnabled = true;

    const jobs = [];
    const scripts = [];

    const fetch_script = async (order, url) => {
      console.log("fetching", url, order);

      const hooks = getHooks(VTTES_MODULE_CONFIGS, url);

      const response = await fetch(url);
      let text = await response.text();

      text = injectHooks(text, hooks);

      // take over jquery .ready
      text = text.replace(
        "jQuery.ready.promise().done( fn );",
        `if(!window.r20esChrome) window.r20esChrome = {};
         if(!window.r20esChrome.readyCallbacks) window.r20esChrome.readyCallbacks = [];
        window.r20esChrome.readyCallbacks.push(fn);`
      );

      // incredibly long loading screens fix
      text= text.replace(
        "},6e4))",
        "},250))"
      );

      scripts.push({order: order, text: text, url: url});
    };

    jobs.push(fetch_script(0, "https://app.roll20.net/v2/js/jquery-1.9.1.js?n"));
    jobs.push(fetch_script(1, "https://app.roll20.net/v2/js/jquery.migrate.js?n"));
    jobs.push(fetch_script(2, "https://app.roll20.net/js/featuredetect.js?2n"));
    jobs.push(fetch_script(3, "https://app.roll20.net/v2/js/patience.js?n"));
    jobs.push(fetch_script(6, "https://app.roll20.net/js/d20/loading.js?n=11&v=11"));
    jobs.push(fetch_script(7, "https://app.roll20.net/assets/firebase.2.4.0.js?n"));
    jobs.push(fetch_script(10, "https://app.roll20.net/js/tutorial_tips.js?n"));

    const now = Date.now();
    jobs.push(fetch_script(5, `https://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?n${now}`));
    jobs.push(fetch_script(8, `https://app.roll20.net/assets/base.js?n${now}`));
    jobs.push(fetch_script(9, `https://app.roll20.net/assets/app.js?n${now}`));

    let script_nonce = "";
    jobs.push(new Promise(ok => {
      const retry = () => {
        const script_with_nonce = document.querySelectorAll("script[nonce]")[0] as any;
        if(script_with_nonce) {
          script_nonce = script_with_nonce.nonce;
          console.log("got nonce!", script_nonce);
          ok();
        }
        else {
          console.log("nonce retry");
          setTimeout(retry, 10);
        }
      }
      retry();
    }));

    jobs.push(new Promise(ok => {
      const retry = async () => {
        console.log("retry");

        const all_script_els = document.querySelectorAll("script") as any as HTMLScriptElement[];
        let startjs_url = null;
        for(const el of all_script_els) {
          if(el.src && el.src.includes("/editor/startjs/")) {
            startjs_url = el.src;
            break;
          }
        }

        if(startjs_url) {
          const idx = startjs_url.indexOf("?timestamp");
          console.log("startjs_url before", startjs_url);
          startjs_url = startjs_url.slice(0, idx) + "?n=1&" + startjs_url.slice(idx+1);
          console.log("startjs_url after", startjs_url);

          await fetch_script(4, startjs_url);

          ok();
        }
        else {
          setTimeout(retry, 10);
        }
      };

      retry();
    }));

    Promise.all(jobs).then(() => {
      console.log(`${jobs.length} jobs are done!`, jobs);

      scripts.sort((a,b) => a.order - b.order);

      console.log(scripts);
      for(const el of scripts) {

        console.log(`dumping ${el.url}`);
        const script_el = document.createElement("script");
        script_el.type = "text/javascript";
        // @ts-ignore
        script_el.nonce = script_nonce;
        script_el.text = el.text;
        script_el.async = false;
        script_el.defer = false;
        document.body.appendChild(script_el);
      }

      const wait = () => {
        const has_jq = typeof(window["$"]) !== "undefined";
        const has_sound_manager = typeof(window.soundManager) !== "undefined";
        const has_d20 = typeof(window.d20) !== "undefined";
        const has_body = !!document.body;

        if(has_jq && has_sound_manager && has_d20 && has_body) {
          console.log("vttes userscript has all depts satisfied, dumping");
          inject_dialog_stuff();
          inject_modules();

          for (let i = 0; i < window.r20esChrome.readyCallbacks.length; i++) {
            try {
              window.r20esChrome.readyCallbacks[i]();
            }
            catch(e) {
              console.error(e);
            }
          }
        }
        else {
          console.log(`vttes userscript is waiting for depts...`);
          setTimeout(wait, 10);
        }
      };
      wait();
    });
  }

  const inject_dialog_stuff = () => {
    const dialog_style = `
      .r20es-indent {
          margin-left: 20px;
      }

      .r20es-dialog button {
          margin: 4px;
      }

      .r20es-dialog>.dialog-header {
          margin: 10px 20px 10px 20px;
      }

      .r20es-dialog>.dialog-body {
          margin: 10px 30px 10px 30px;
          overflow: auto;
      }

      .r20es-dialog>.dialog-footer {
          position: sticky;
          background-color: #f5f5f5;
          right: 0;
          bottom: 0;
          left: 0;
      }

      .r20es-dialog>.dialog-footer>hr {
          margin: 0;
      }

      .dialog-footer>.dialog-footer-content {
          padding: 20px;
          box-sizing: border-box;
      }

      .dialog-footer>.dialog-footer-content .btn {
          width: auto;
          height: auto;
      }

      .r20es-dialog h3 {
          margin-top: 5px;
          margin-bottom: 5px;
      }

      .r20es-dialog>hr {
          margin-top: 4px;
          margin-bottom: 4px;
      }

      .r20es-dialog {
          background-color: rgb(253, 253, 253);
          /*height: 100%;*/
          display: grid;
          grid-template-rows: auto auto auto;
      }

      .r20es-dialog th {
          white-space: nowrap;
      }

      .r20es-dialog th {
          padding: 4px;
          padding-left: 8px;
      }

      .r20es-dialog tr {
          background-color: rgb(250, 250, 250);
      }

      .r20es-dialog .table-head {
          background-color: rgb(240, 240, 240);
      }

      .r20es-dialog tr:nth-child(even) {
          background-color: rgb(240, 240, 240);
      }

      .r20es-dialog table caption {
          font-weight: bold;
          font-size: 1.25em;
      }

      .r20es-code {
          font-family: monospace;
          font-size: 0.85em;
          padding: 4px;
          padding-left: 8px;
      }

      .r20es-welcome {
          background-color: #ffffff;
          max-width: 30%;
          right: 20%;
          top: 5%;
          position: absolute;
          padding: 10px;
          z-index: 10000;
          border: 1px solid black;
      }

      dialog::backdrop {
          /* native */
          background-color: rgba(0, 0, 0, 0.45);
      }

      dialog+.backdrop {
          /* polyfill */
          background-color: rgba(0, 0, 0, 0.45);
      }

      dialog {
          overflow-y: auto;
          overflow-x: auto;
          max-height: 90%;
          max-width: 60%;
          border: none;
          padding: 0;
          /*height: auto;*/
      }

      .r20es-big-dialog {
          /*height: 100%;*/
      }

      .r20es-token-img-hover .r20es-hover-block {
          display: none;
      }

      .r20es-token-img-hover:hover .r20es-hover-block{
          padding: 4px;
          background-color: rgba(255,255,255, 0.5);
          border: 4px dashed black;
          display: block;
      }
    `;

    const injectCSS = (style, root, id) => {
      let c = document.createElement("style");
      c.id = id;
      c.innerText = style;
      root.appendChild(c);
    };

    const STYLE_CSS = "r20es-dialog-style-css";
    const POLYFILL_CSS = "r20es-dialo-gpolyfill-css";

    findByIdAndRemove(POLYFILL_CSS);
    findByIdAndRemove(STYLE_CSS);

    if(BUILD_CONSTANT_FOR_BROWSER === "firefox") {
      console.log("DialogFormsBootstrapper: injecting dialog-polyfill");

      dialog_polyfill_script();
      injectCSS(dialog_polyfill_css, document.body, POLYFILL_CSS);

      console.log("DialogFormsBootstrapper: done!");
    }

    injectCSS(dialog_style, document.body, STYLE_CSS);
  };

  if(!BUILD_CONSTANT_IS_FOR_USERSCRIPT) {
    inject_dialog_stuff();
  }

  if(!BUILD_CONSTANT_IS_FOR_USERSCRIPT) {
    let ids = [];
    for(const id in VTTES_MODULE_CONFIGS) {
      ids.push(id);
    }
    window.postMessage({ r20sAppWantsInitialConfigs: ids }, Config.appUrl);
  }

  // @ts-ignore
  window.r20es = window.r20es || {};
  window.r20es.hooks = VTTES_MODULE_CONFIGS;

  if(!BUILD_CONSTANT_IS_FOR_USERSCRIPT) {
    // dispose modules
    if ("r20esDisposeTable" in window) {
      for (const key in window.r20esDisposeTable) {
        const fx = window.r20esDisposeTable[key];
        console.log(`Disposing module by key ${key}`);

        try {
          fx();
        } 
        catch (err) {
          console.error(err);
        }
      }

      window.r20esDisposeTable = {};
    }
  }

  window.r20esInstalledModuleTable = window.r20esInstalledModuleTable || {};
  window.r20esDisposeTable = window.r20esDisposeTable || {};
  window.r20es.isLoading = true;

  if(!BUILD_CONSTANT_IS_FOR_USERSCRIPT) {
    if(window.r20es.recvPluginMsg) {
      window.removeEventListener("message", window.r20es.recvPluginMsg);
    }
  }

  const inject_modules = () => {
    if(window.hasInjectedModules) {
      return;
    }

    for(const module_init of VTTES_MODULES) {
      try {
        module_init();
      }
      catch(e) {
        console.error(e);
      }
    }

    window.hasInjectedModules = true;
    console.log("modules injected!");

    if(BUILD_CONSTANT_FOR_BROWSER === "chrome") {
      // @BootstrapFlashWorkaroundStyle
      findByIdAndRemove(ELEMENT_ID_BOOTSTRAP_FLASH_WORKAROUND_STYLE);
    }
  }

  if(!BUILD_CONSTANT_IS_FOR_USERSCRIPT) {
    window.r20es.recvPluginMsg = (e) => {
      if (e.origin !== Config.appUrl) return;
      console.log("WebsiteBootstrap msg:", e);

      if(e.data.r20esInitialConfigs) {
        const configs = e.data.r20esInitialConfigs;

        for (var id in configs) {
          const hook = window.r20es.hooks[id];
          const cfg = configs[id];

          if(hook.config) {
            // overwrite defaults
            Object.assign(hook.config, cfg);
          } else {
            hook.config = cfg;
          }

          if(!("enabled" in hook.config)) {
            hook.config.enabled = true;
          }
        }

        console.log("WebsiteBootstrap.js applied INITIAL configs.");
        window.injectWebsiteOK = true;

        window.postMessage({[MESSAGE_KEY_LOAD_MODULES]: true}, Config.appUrl);

        window.r20es.save_configs();
      }
      else if(e.data[MESSAGE_KEY_INJECT_MODULES]) {
        inject_modules();
      }
    };

    window.addEventListener("message", window.r20es.recvPluginMsg);
  }

  window.r20es.save_configs = () => {
    let patch = {};
    for(const id in window.r20es.hooks) {
      const hook = window.r20es.hooks[id];
      patch[id] = hook.config;
    }

    // NOTE(justasd): save on localstorage as well so that folks going between the extension and the
    // userscript have their settings carry over.
    // 2021-09-21
    const str = JSON.stringify(patch, null, 0);
    window.localStorage.setItem(USERSCRIPT_SAVE_DATA_KEY, str);

    if(!BUILD_CONSTANT_IS_FOR_USERSCRIPT) {
      window.postMessage({ r20esAppWantsSync: patch }, Config.appUrl);
    }
  };

  window.r20es.onAppLoad = EventEmitter.copyExisting(window.r20es.onAppLoad);
  window.r20es.onPageChange = EventEmitter.copyExisting(window.r20es.onPageChange);

  if(window.r20es.isLoading) {
    const cb = () => {
      window.r20es.isLoading = false;
    };

    window.r20es.onAppLoad.removeEventListener(cb);
    window.r20es.onAppLoad.addEventListener(cb);
  }

  window.r20es.onLoadingOverlayHide = () => {
    if("r20es" in window) {

      let first_load = false;

      if(!window.r20es.isWindowLoaded) {
        window.r20es.isWindowLoaded = true;
        window.r20es.onAppLoad.fire();
        first_load = true;
      }

      window.r20es.onPageChange.fire(first_load);
    } else {
      alert("VTTES global state is undefined. VTTES will not function properly.");
    }
  };

  if(!BUILD_CONSTANT_IS_FOR_USERSCRIPT) {
    if(window.r20es.isWindowLoaded) {
      window.r20es.onAppLoad.fire();
      window.r20es.onPageChange.fire(false);
    }
  }

  if(!BUILD_CONSTANT_IS_FOR_USERSCRIPT) {
    document.removeEventListener("keyup", window.r20es.onDocumentMouseUp);
    document.removeEventListener("keydown", window.r20es.onDocumentMouseUp);
  }

  window.r20es.keys = window.r20es.keys || {
    altDown: false,
    shiftDown: false,
    ctrlDown: false,
    metaDown: false,
  };

  window.r20es.onDocumentMouseUp = e => {
    window.r20es.keys.altDown = e.altKey;
    window.r20es.keys.shiftDown = e.shiftKey;
    window.r20es.keys.ctrlDown = e.ctrlKey;

    window.r20es.keys.metaDown = (!e.metaKey && e.key && e.key === "OS")
      ? e.type === "keydown"
      : e.metaKey;
  };

  document.addEventListener("keyup", window.r20es.onDocumentMouseUp);
  document.addEventListener("keydown", window.r20es.onDocumentMouseUp);

  if(BUILD_CONSTANT_IS_FOR_USERSCRIPT) {

    {
      let str_data = window.localStorage.getItem(USERSCRIPT_SAVE_DATA_KEY);
      let config = {};

      if(str_data) {
        try {
          config = JSON.parse(str_data);
        }
        catch(e) {
          console.error("Failed to parse vttes config data", str_data, e);
        }
      }

      for(const key in window.r20es.hooks) {
        const hook = window.r20es.hooks[key];
        const loaded_config = config[key] || {};

        if(hook.config) {
          Object.assign(hook.config, loaded_config);
        } else {
          hook.config = loaded_config;
        }

        if(!("enabled" in hook.config)) {
          hook.config.enabled = true;
        }
      }
    }
  }
};
