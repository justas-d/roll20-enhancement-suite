import { VTTES_MODULE_CONFIGS } from "./Configs";
import { VTTES_MODULES }from "./Modules";
import { Config } from "./utils/Config";
import { safeCall, findByIdAndRemove } from "./utils/MiscUtils";
import { DOM } from "./utils/DOM";
import {EventEmitter} from "./utils/EventEmitter";
import { saveAs } from 'save-as'
import {isChromium} from "./utils/BrowserDetection";
import {apply_mods_to_text} from './HookUtils';
import browser from 'browser-detect';

import { dialog_polyfill_script, dialog_polyfill_css } from "./dialog_polyfill";

const LOCALSTORAGE_SAVE_DATA_KEY = "vttes_userscript_config";

export const bootstrap = () => {

  // @FirefoxExtensionReloading
  window.hasInjectedModules = false;

  setTimeout(() => {
    if(typeof (window.d20) !== "undefined" && 
       typeof (window.r20es) !== "undefined" &&
       window.hasInjectedModules
    ) {
      return;
    }

    const browser_info = browser();

    const popup = (
      <div className="r20es-welcome">
        <h2>VTTES - Uh oh!</h2>
        <p>Looks like loading is taking a while. There might be a bug somewhere.</p>
        <p>Please try:</p>
        <ul>
          <li>Refreshing the page.</li>
          <li>Disabling all other extensions.</li>
          {browser_info.name !== "firefox" && <li>Using Firefox.</li>}
        </ul>

        <p>If this persists, please visit the <a href={Config.discordInvite}>Discord server</a> and let us know.</p>

        <p className="r20es-code">
          {`window.d20: ${typeof (window.d20)} ${window.d20}`}<br />
          {`window.r20es: ${typeof (window.r20es)} ${window.r20es}`}<br />
          {`window.hasInjectedModules: ${typeof (window.hasInjectedModules)} ${window.hasInjectedModules}`}<br/>
          {`VTTES Version: ${BUILD_CONSTANT_VERSION}`}<br/>
          {`Browser: ${browser_info.name} ${browser_info.versionNumber}`}<br/>
          {BUILD_CONSTANT_TARGET_PLATFORM === "userscript" && "Is userscript!"}<br/>
        </p>

        <button onClick={() => popup.remove()}>OK</button>
      </div> as any
    );

    const root = document.getElementById("playerzone");
    root.parentElement.insertBefore(popup, root);
  }, 25 * 1000);

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
      
      .r20es-settings-dialog h1 { color: #333; }
      .r20es-settings-dialog h2 { color: #333; }
      .r20es-settings-dialog h3 { color: #333; }
      .r20es-settings-dialog h4 { color: #333; }
      .r20es-settings-dialog h5 { color: #333; }
      .r20es-settings-dialog h6 { color: #333; }
      .r20es-settings-dialog input[type=number] { color: #555; }
      .r20es-settings-dialog input[type=text] { color: #555; }
      .r20es-settings-dialog select { color: #555; }
      .r20es-dialog h1 { color: #333; }
      .r20es-dialog h2 { color: #333; }
      .r20es-dialog h3 { color: #333; }
      .r20es-dialog h4 { color: #333; }
      .r20es-dialog h5 { color: #333; }
      .r20es-dialog h6 { color: #333; }
      .r20es-dialog input[type=number] { color: #555; }
      .r20es-dialog input[type=text] { color: #555; }
      .r20es-dialog select { color: #555; }

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
          color: #0f0f0f;
      }

      html.dark .r20es-dialog th {
        color: #0f0f0f !important;
      }

      .r20es-dialog th {
          white-space: nowrap;
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

      .r20es-welcome h1 { color: #333; }
      .r20es-welcome h2 { color: #333; }
      .r20es-welcome h3 { color: #333; }
      .r20es-welcome h4 { color: #333; }
      .r20es-welcome h5 { color: #333; }
      .r20es-welcome h6 { color: #333; }
      .r20es-welcome {
          background-color: #ffffff;
          color: #333;
          max-width: 30%;
          right: 20%;
          top: 5%;
          position: absolute;
          padding: 10px;
          z-index: 11000;
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

    // @FirefoxExtensionReloading
    findByIdAndRemove(POLYFILL_CSS);
    findByIdAndRemove(STYLE_CSS);

    // @ts-ignore
    if(typeof(HTMLDialogElement) != "function") {
      console.log("DialogFormsBootstrapper: injecting dialog-polyfill");

      dialog_polyfill_script();
      injectCSS(dialog_polyfill_css, document.body, POLYFILL_CSS);

      console.log("DialogFormsBootstrapper: done!");
    }

    injectCSS(dialog_style, document.body, STYLE_CSS);
  }


  if(BUILD_CONSTANT_TARGET_PLATFORM === "chrome" ||
     BUILD_CONSTANT_TARGET_PLATFORM === "userscript"
  ) {
    const jobs = [];
    const scripts = [];

    const do_replacing = (text: string, url: string) => {
      text = apply_mods_to_text(text, url, VTTES_MODULE_CONFIGS);

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

      return text;
    };

    const fetch_script = async (order: number, url: string) => {
      console.log("fetching", url, order);

      const response = await fetch(url);
      let text = await response.text();

      text = do_replacing(text, url);

      scripts.push({order: order, text: text, id: url});
    };

    // @UserscriptScriptFetching
    const fetch_script_from_userscript = (order: number, key: string, url: string) => new Promise<void>(ok => {

      console.log("fetching from userscript", key, url, order);

      const wait = () => {
        let data = window[key];
        const did_we_get_it = typeof(data) === "string";

        if(did_we_get_it) {
          data = do_replacing(data, url);
          scripts.push({order: order, text: data, id: url});
          window[key] = undefined;
          ok();
          return;
        }
        else {
          setTimeout(wait, 10);
        }
      }

      wait();
    });

    /*
      NOTE(justasd): script order as of 2022-01-21
      0 https://app.roll20.net/v2/js/jquery-1.9.1.js
      1 https://app.roll20.net/v2/js/jquery.migrate.js
      2 https://app.roll20.net/js/featuredetect.js?2
      3 https://app.roll20.net/v2/js/patience.js
      4 https://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?
      5 https://app.roll20.net/editor/startjs/?timestamp=
      6 https://app.roll20.net/js/d20/loading.js?v=11
      7 https://cdn.roll20.net/production/vtt.bundle.js
      8 https://app.roll20.net/js/tutorial_tips.js
     */

    const now = Date.now();

    jobs.push(fetch_script(0, "https://app.roll20.net/v2/js/jquery-1.9.1.js?n"));
    jobs.push(fetch_script(1, "https://app.roll20.net/v2/js/jquery.migrate.js?n"));
    jobs.push(fetch_script(2, "https://app.roll20.net/js/featuredetect.js?2n"));
    jobs.push(fetch_script(3, "https://app.roll20.net/v2/js/patience.js?n"));
    jobs.push(fetch_script(4, `https://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?n${now}`));

    jobs.push(fetch_script(6, "https://app.roll20.net/js/d20/loading.js?n=11&v=11"));

    if(BUILD_CONSTANT_TARGET_PLATFORM === "chrome" || 
       BUILD_CONSTANT_TARGET_PLATFORM === "userscript"
    ) {
      const script_elements = window.document.body.querySelectorAll("script") as any as HTMLScriptElement[];
      let bundle_url = null;

      for(const el of script_elements) {
        if(el.src && el.src.includes("cdn.roll20.net/vtt/legacy/production/latest/vtt.bundle")) {
          bundle_url = el.src;
        }
      }
      console.log(`Got bundle url: ${bundle_url}`);
      if(bundle_url == null) {
        alert("VTTES Error: Failed to find the bundle URL. VTTES will not function. Please report this on our Discord");
        return;
      }

      if(BUILD_CONSTANT_TARGET_PLATFORM === "chrome") {
        // @ChromeScriptFetching
        jobs.push(new Promise<void>(ok => {
          const listener = (msg) => {
            if(msg.origin !== Config.appUrl) {
              return;
            }

            if(msg.data.VTTES_CDN_SCRIPTS) {
              console.log("Bootstrap got VTTES_CDN_SCRIPTS", msg.data);
              const data = msg.data.VTTES_CDN_SCRIPTS;

              const handle_script = (order: number, data: string, url: string) => {
                data = do_replacing(data, url);

                scripts.push({
                  order: order, 
                  text: data,
                  id: url
                });
              };

              handle_script(7, data.VTT_BUNDLE, bundle_url);

              window.removeEventListener("message", listener);
              ok();
            }
          };

          window.addEventListener("message", listener);

          console.log("Bootstrap sending VTTES_BOOTSTRAP_WANTS_CDN_SCRIPTS");
          window.postMessage({VTTES_BOOTSTRAP_WANTS_CDN_SCRIPTS: bundle_url}, Config.appUrl);
        }));
      }
      else if(BUILD_CONSTANT_TARGET_PLATFORM === "userscript") {
        // @UserscriptScriptFetching
        jobs.push(fetch_script_from_userscript(7, "USERSCRIPT_VTT_BUNDLE_DATA", bundle_url));
      }
    }

    jobs.push(fetch_script(8, "https://app.roll20.net/js/tutorial_tips.js?n"));
    
    let script_nonce = "";
    jobs.push(new Promise<void>(ok => {
      let nth_attempt = 0;
      const retry = () => {
        const scripts_with_nonce = document.querySelectorAll("script[nonce]") as any;

        for(const script of scripts_with_nonce) {
          const nonce = script.nonce;

          if(nonce && nonce.length && nonce.length > 0) {
            script_nonce = nonce;
            console.log(`got nonce! it is: '${script_nonce}'`, script);
            ok();
            return;
          }
        }

        nth_attempt += 1;
        if((nth_attempt % 100) == 0) {
          console.log("nonce retry");
        }
        setTimeout(retry, 10);
      }
      retry();
    }));

    jobs.push(new Promise<void>(ok => {
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

          await fetch_script(5, startjs_url);

          ok();
        }
        else {
          setTimeout(retry, 10);
        }
      };

      retry();
    }));

    Promise.all(jobs).then(() => {

      scripts.sort((a,b) => a.order - b.order);

      console.log(`${jobs.length} jobs are done!`, jobs);
      console.log(scripts);

      for(const el of scripts) {

        console.log(`dumping ${el.id}`);
        const script_el = document.createElement("script");
        script_el.type = "text/javascript";
        // @ts-ignore
        script_el.nonce = script_nonce;
        script_el.text = el.text;
        script_el.async = false;
        script_el.defer = false;
        document.body.appendChild(script_el);
      }

      let nth_wait = 0;
      const wait = () => {
        const has_jq = typeof(window["$"]) !== "undefined";
        const has_sound_manager = typeof(window.soundManager) !== "undefined";
        const has_d20 = typeof(window.d20) !== "undefined";
        const has_body = !!document.body;
        const configs_loaded = window.r20es && window.r20es.have_configs_been_loaded;

        if(has_jq && has_sound_manager && has_d20 && has_body && configs_loaded) {
          console.log("vttes has all depts satisfied, dumping");
          inject_dialog_stuff();
          inject_modules();

          // NOTE(justasd): beyond20 depends on this event.
          // 2021-10-02
          {
            const DOMContentLoaded_event = document.createEvent("Event");
            DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
            window.document.dispatchEvent(DOMContentLoaded_event);
          }

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
          nth_wait += 1;
          if((nth_wait % 100) == 0) {
            console.log(`vttes is waiting for depts...`);
          }
          setTimeout(wait, 10);
        }
      };
      wait();
    });
  }

  if(BUILD_CONSTANT_TARGET_PLATFORM === "firefox") {
    inject_dialog_stuff();
  }

  if(BUILD_CONSTANT_TARGET_PLATFORM === "firefox" ||
     BUILD_CONSTANT_TARGET_PLATFORM === "chrome" 
  ) {
    let ids = [];
    for(const id in VTTES_MODULE_CONFIGS) {
      ids.push(id);
    }
    window.postMessage({r20sAppWantsInitialConfigs: ids}, Config.appUrl);
  }

  // @ts-ignore
  window.r20es = window.r20es || {};
  window.r20es.hooks = VTTES_MODULE_CONFIGS;

  // @FirefoxExtensionReloading
  if(BUILD_CONSTANT_TARGET_PLATFORM === "firefox") {
    // NOTE(justasd): dispose previously installed modules, in case there are any (this allows us to
    // quickly reload the extension during development on firefox)
    if("r20esDisposeTable" in window) {
      for(const key in window.r20esDisposeTable) {
        const fx = window.r20esDisposeTable[key];

        try {
          fx();
        } 
        catch (err) {
          console.log(`Exception when disposing module by key ${key}`);
          console.error(err);
        }
      }

      window.r20esDisposeTable = {};
    }
  }

  window.r20esInstalledModuleTable = window.r20esInstalledModuleTable || {};
  window.r20esDisposeTable = window.r20esDisposeTable || {};
  window.r20es.isLoading = true;

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
  }

  // @FirefoxExtensionReloading
  if(BUILD_CONSTANT_TARGET_PLATFORM === "firefox") {
    if(window.r20es.receive_message_from_content_script) {
      window.removeEventListener("message", window.r20es.receive_message_from_content_script);
    }
  }

  if(BUILD_CONSTANT_TARGET_PLATFORM === "firefox" ||
     BUILD_CONSTANT_TARGET_PLATFORM === "chrome" 
  ) {
    window.r20es.receive_message_from_content_script = (e) => {
      if(e.origin !== Config.appUrl) {
        return;
      }

      console.log("WebsiteBootstrap received message:", e);

      if(e.data.r20esInitialConfigs) {
        const configs = e.data.r20esInitialConfigs;

        for(var id in configs) {
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

        window.r20es.save_configs();
        window.r20es.have_configs_been_loaded = true;

        if(BUILD_CONSTANT_TARGET_PLATFORM === "firefox") {
          inject_modules();
        }
      }
    };

    window.addEventListener("message", window.r20es.receive_message_from_content_script);
  }

  window.r20es.save_configs = () => {
    let patch = {};
    for(const id in window.r20es.hooks) {
      const hook = window.r20es.hooks[id];
      patch[id] = hook.config;
    }

    if(BUILD_CONSTANT_TARGET_PLATFORM === "firefox" ||
       BUILD_CONSTANT_TARGET_PLATFORM === "chrome" 
    ) {
      window.postMessage({r20esAppWantsSync: patch}, Config.appUrl);
    }
    else if(BUILD_CONSTANT_TARGET_PLATFORM === "userscript") {
      const str = JSON.stringify(patch, null, 0);
      window.localStorage.setItem(LOCALSTORAGE_SAVE_DATA_KEY, str);
    }
  };

  // @FirefoxExtensionReloading for the copy
  window.r20es.onAppLoad = EventEmitter.copyExisting(window.r20es.onAppLoad);
  window.r20es.onPageChange = EventEmitter.copyExisting(window.r20es.onPageChange);

  if(window.r20es.isLoading) {
    window.r20es.onAppLoad.addEventListener(() => {
      window.r20es.isLoading = false;
    });
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

  // @FirefoxExtensionReloading
  if(BUILD_CONSTANT_TARGET_PLATFORM === "firefox") {
    if(window.r20es.isWindowLoaded) {
      window.r20es.onAppLoad.fire();
      window.r20es.onPageChange.fire(false);
    }

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

  if(BUILD_CONSTANT_TARGET_PLATFORM === "userscript") {
    let str_data = window.localStorage.getItem(LOCALSTORAGE_SAVE_DATA_KEY);
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

    window.r20es.have_configs_been_loaded = true;
  }
};
