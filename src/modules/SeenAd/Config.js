export default {
    id: "seenadOverride",
    force: true,

    includes: "/editor/startjs/",
    find: "d20ext.showGoogleAd();",
    patch: 'window.d20ext.seenad = !0, $("#loading-overlay").find("div").hide(), window.currentPlayer && d20.Campaign.pages.length > 0 && d20.Campaign.handlePlayerPageChanges(), void $.get("/editor/startping/true");'
};