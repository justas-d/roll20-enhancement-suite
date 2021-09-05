import {MESSAGE_KEY_CHROME_INJECTION_DONE} from "../MiscConstants";
import {Config} from 'utils/Config';

{
  {
    const DOMContentLoaded_event = document.createEvent("Event");
    DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
    window.document.dispatchEvent(DOMContentLoaded_event);
  }

  const waitTime = 200;
  let waitedFor = 0;

  const waitForDepts = () => {

    const hasJQuery = typeof(window.$) !== "undefined";
    const hasSoundManager = typeof(window.soundManager) !== "undefined";
    const hasD20 = typeof(window.d20) !== "undefined";

    if (!hasJQuery || !hasSoundManager || !hasD20) {
      waitedFor += waitTime;
      setTimeout(waitForDepts, waitTime);

      console.log("WAITING FOR DEPTS.");
      return;
    }

    console.log(`All dependencies fulfilled after ${waitedFor}ms`);

    for (let i = 0; i < window.r20esChrome.readyCallbacks.length; i++) {
      window.r20esChrome.readyCallbacks[i]();
    }

    /*
      NOTE(Justas):
      This notifies ContentScript.js to inject module scripts.
      Without this on Chrome, the modules would be injected BEFORE any roll20 scripts are run,
      contrary to what happens on Firefox.
    */

    window.postMessage({
      [MESSAGE_KEY_CHROME_INJECTION_DONE]: true
    }, Config.appUrl);
  };

  waitForDepts();
}
