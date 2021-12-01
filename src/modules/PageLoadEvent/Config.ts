export default {
    id: "createFinalPageLoadEvent",
    force: true,

    mods: [
      {
        includes: "vtt.bundle.js",
        find: `$("#loading-overlay").hide()`,
        patch: `$("#loading-overlay").hide();if(window.r20es && window.r20es.onLoadingOverlayHide) window.r20es.onLoadingOverlayHide(); `
      },
    ],
};
