import {replaceAll} from './utils/MiscUtils'
import {getHooks, injectHooks} from './HookUtils'
import {EventEmitter} from "./utils/EventEmitter";

/*
 *
* can remove bootstrappers easily
* what do we do with static assets?
* the only thing that we realistically have to do are:
  * run search/replace hooks
  * inject module code

  we can skip all the bootstrapping and bookkeeping that lets us quickly reload the extension in ff.

 */

// state setup
// TODO big code dupe from content script and website bootstrap
// @ts-ignore
window.r20es = window.r20es || {};

window.r20esInstalledModuleTable = window.r20esInstalledModuleTable || {};
window.r20esDisposeTable = window.r20esDisposeTable || {};
window.r20es.isLoading = true;
window.r20es.hooks = {};

window.r20es.onAppLoad = new EventEmitter();
window.r20es.onPageChange = new EventEmitter();

window.r20es.onLoadingOverlayHide = function () {
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
console.log(window.r20es);

// hook setup
const adHook = (hook) => {
  window.r20es.hooks[hook.id] = hook;

  //const loaded_config = ...;
  //if(hook.config) {
  //  Object.assign(hook.config, loaded_config);
  //} else {
  //  hook.config = loaded_config;
  //}

  // placeholder for now
          if(!(hook.config)) {
            hook.config = {};
          }

  if(!("enabled" in hook.config)) {
    hook.config.enabled = true;
  }

  console.log(hook.id);
  console.log(hook.config);
}

import Hook_ExposeD20 from './modules/ExposeD20/Config'
adHook(Hook_ExposeD20);
import Hook_PageLoadEvent from './modules/PageLoadEvent/Config'
adHook(Hook_PageLoadEvent);
import Hook_DrawCurrentLayer from './modules/DrawCurrentLayer/Config'
adHook(Hook_DrawCurrentLayer);

// TODO: storage strat: https://wiki.greasespot.net/GM.setValue

// hijack app.js
{
  let app_script = "";

  const fetch_script = async (url) => {

    const response = await fetch(url);
    let text = await response.text();

    const hooks = getHooks(window.r20es.hooks, url);
    text = injectHooks(text, hooks);

    app_script = text;
  };

  fetch_script(`/assets/app.js?n${Date.now()}`);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach(void_node => {

        var node = void_node as any as HTMLScriptElement;

        // @ts-ignore
        if(node.nodeType === 1 && node.tagName === 'SCRIPT') {
          const src = node.src || '';
          if(src.indexOf('assets/app.js') > -1) {
            console.log(app_script.length);

            // @ts-ignore
            window.eval(app_script);

            node.type = 'javascript/blocked';
            node.parentElement.removeChild(node);
            observer.disconnect();
          }
        }
      })
    })
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  })
}

// inject modules
import Mod_DrawCurrentLayer from './modules/DrawCurrentLayer/Module'
Mod_DrawCurrentLayer();


/*

// ==UserScript==
// @name         Loader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://app.roll20.net/editor/
// @run-at       document-start
// @require      file:///work/vttes/builds/userscript/dev/userscript.js
// @webRequest   [{"selector":{"include":"*://app.roll20.net/assets/app.js?*","exclude":"*://app.roll20.net/assets/app.js?n*"},"action":"cancel"}]
// ==/UserScript==
 */
