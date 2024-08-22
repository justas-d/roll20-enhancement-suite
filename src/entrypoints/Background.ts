import { VTTES_MODULE_CONFIGS } from '../Configs'
import {getBrowser, replaceAll} from '../utils/MiscUtils';
import {doesBrowserNotSupportResponseFiltering} from "../utils/BrowserDetection";
import { apply_mods_to_text } from "../HookUtils";
import {replace_all_and_count} from "../utils/MiscUtils";

if(doesBrowserNotSupportResponseFiltering()) {

  // @ChromeScriptFetching
  getBrowser().runtime.onMessage.addListener((request, sender, send_response) => {


    if(request.VTTES_WANTS_CDN_SCRIPTS_FROM_BACKGROUND) {

      var bundle_url = request.VTTES_WANTS_CDN_SCRIPTS_FROM_BACKGROUND;

      (async function () {
        console.log("got VTTES_WANTS_CDN_SCRIPTS_FROM_BACKGROUND");

        const req = await fetch(`${bundle_url}?n${Date.now()}`);
        const text = await req.text();

        const results = {
          VTT_BUNDLE: text,
        };

        console.log("VTTES_WANTS_CDN_SCRIPTS_FROM_BACKGROUND results:", results);

        send_response(results);
      })();

      return true;
    }

    return false;
  });

  let editor_requested_at = 0;

  const request_blocker = (request) => {

    if(request.url === "https://app.roll20.net/editor" ||
       request.url === "https://app.roll20.net/editor/" ||
       request.url.startsWith("https://app.roll20.net/editor/#") ||
       request.url.startsWith("https://app.roll20.net/editor#") ||
       request.url.startsWith("https://app.roll20.net/editor/?") ||
       request.url.startsWith("https://app.roll20.net/editor?")
    ) {
      editor_requested_at = request.timeStamp;
    }

    console.log(request.url);

    // NOTE(justasd): ignore any requests from iframes. We need this for char sheets to work as they
    // request some of the same scripts (jquery, patience etc) as the editor and we don't want to
    // cancel those!
    // 2021-10-02
    if(request.parentFrameId != -1) {
      return;
    }

    let cancel = false;
    if(request.url.includes("cdn.userleap.com")) {
      cancel = true;
    }
    else if(request.url.includes("google-analytics.com")) {
      cancel = true;
    }
    else if(request.url.includes("app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?")) {
      if(!request.url.includes("app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?n")) {
        cancel = true;
      }
    }
    else if(request.url.includes("app.roll20.net/v2/js/jquery-1.9.1.js")) {
      if(!request.url.includes("app.roll20.net/v2/js/jquery-1.9.1.js?n")) {
        cancel = true;
      }
    }
    else if(request.url.includes("app.roll20.net/v2/js/jquery.migrate.js")) {
      if(!request.url.includes("app.roll20.net/v2/js/jquery.migrate.js?n")) {
        cancel = true;
      }
    }

    else if(request.url.includes("app.roll20.net/js/featuredetect.js?2")) {
      if(!request.url.includes("app.roll20.net/js/featuredetect.js?2n")) {
        cancel = true;
      }
    }
    else if(request.url.includes("app.roll20.net/v2/js/patience.js")) {
      if(!request.url.includes("app.roll20.net/v2/js/patience.js?n")) {
        cancel = true;
      }
    }
    else if(request.url.includes("app.roll20.net/editor/startjs/?timestamp")) {
      cancel = true;
    }
    else if(request.url.includes("app.roll20.net/js/d20/loading.js?v=11")) {
      if(!request.url.includes("app.roll20.net/js/d20/loading.js?n=11&v=11")) {
        cancel = true;
      }
    }
    else if(request.url.includes("app.roll20.net/js/tutorial_tips.js")) {
      if(!request.url.includes("app.roll20.net/js/tutorial_tips.js?n")) {
        cancel = true;
      }
    }
    else if(request.url.includes("cdn.roll20.net/vtt/legacy/production/latest/vtt.bundle")) {
      if(!request.url.includes("cdn.roll20.net/vtt/legacy/production/latest/vtt.bundle?n")) {
        cancel = true;
      }
    }

    if(cancel) {

      {
        const delta = request.timeStamp - editor_requested_at;
        if(delta > 4000) {
          console.log("Would have cancelled this request, but it's too late since the last editor request to do so", request);
          return;
        }
      }

      //console.log("cancel", request.url, request);
      return { cancel: true };
    }
    
    //console.log("pass", request.url, request);
  };

  getBrowser().webRequest.onBeforeRequest.addListener(
    request_blocker,
    {
      urls: [
        "*://app.roll20.net/*",
        "*://cdn.roll20.net/*",
      ],
      types: ["main_frame", "script"],
    },
    ["blocking"]
  );
}
else {
  const redirect_targets = [
    "https://app.roll20.net/editor/startjs",
    "https://cdn.roll20.net/vtt/legacy/production/latest/vtt.bundle",
  ];

  // thanks, Firefox.
  const request_listener = (request) => {

    const is_redir = typeof(redirect_targets.find(f => request.url.startsWith(f))) !== "undefined";
    //console.log(`${is_redir}: ${request.url}`);

    if(!is_redir) {
      return;
    }

    const filter = getBrowser().webRequest.filterResponseData(request.requestId);
    const decoder = new TextDecoder("utf-8");

    let string_buffer = "";

    filter.ondata = e => {
      string_buffer += decoder.decode(e.data, {stream: true});
    };

    filter.onstop = e => {
      const hooked_data = apply_mods_to_text(string_buffer, request.url, VTTES_MODULE_CONFIGS);

      filter.write(new TextEncoder().encode(hooked_data));
      filter.close();
    };
  };

  getBrowser().webRequest.onBeforeRequest.addListener(
    request_listener,
    {urls: [
      "*://app.roll20.net/*",
      "*://cdn.roll20.net/*"
    ]},
    ["blocking"]
  );
}

console.log("window.r20es Background hook script initialized");
