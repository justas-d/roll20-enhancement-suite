const data = [
  [{
    selector: {
      include: "*://browser.sentry-cdn.com/*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://www.datadoghq-browser-agent.com/datadog-rum.js",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://cdn.userleap.com/*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://www.google-analytics.com/*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?*",
      exclude: "*://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?n*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://app.roll20.net/v2/js/jquery-1.9.1.js",
      exclude: "*://app.roll20.net/v2/js/jquery-1.9.1.js?n*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://app.roll20.net/v2/js/jquery.migrate.js",
      exclude: "*://app.roll20.net/v2/js/jquery.migrate.js?n*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://app.roll20.net/js/featuredetect.js?2",
      exclude: "*://app.roll20.net/js/featuredetect.js?2n*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://app.roll20.net/v2/js/patience.js",
      exclude: "*://app.roll20.net/v2/js/patience.js?n*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://app.roll20.net/editor/startjs/?timestamp*",
      exclude: "*://app.roll20.net/editor/startjs/?n*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://app.roll20.net/js/d20/loading.js?v=11",
      exclude: "*://app.roll20.net/js/d20/loading.js?n=11&v=11",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://app.roll20.net/assets/firebase.2.4.0.js",
      exclude: "*://app.roll20.net/assets/firebase.2.4.0.js?n*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://app.roll20.net/assets/base.js?*",
      exclude: "*://app.roll20.net/assets/base.js?n*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://app.roll20.net/assets/app.js?*",
      exclude: "*://app.roll20.net/assets/app.js?n*",
    }, 
    action: "cancel"
  }],
  [{
    selector: {
      include: "*://app.roll20.net/js/tutorial_tips.js",
      exclude: "*://app.roll20.net/js/tutorial_tips.js?n*",
    }, 
    action: "cancel"
  }],
];

for(const el of data) {
  console.log(`// @webRequest ${JSON.stringify(el)}`);
}
