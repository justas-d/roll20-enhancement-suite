import {getHooks, injectHooks} from './HookUtils';
import { bootstrap } from "./Bootstrap";

window.enhancementSuiteEnabled = true;

bootstrap();

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

