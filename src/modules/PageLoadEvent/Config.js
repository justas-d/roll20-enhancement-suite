export default {
    id: "createFinalPageLoadEvent",
    force: true,

    includes: "assets/app.js",
    find: `$("#loading-overlay").hide()`,
    patch: `$("#loading-overlay").hide();if(window.r20es && window.r20es.onLoadingOverlayHide) window.r20es.onLoadingOverlayHide(); `
};
