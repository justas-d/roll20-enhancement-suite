export default {
  id: "seenadOverride",
  force: true,

  // NOTE(justasd): the call to showGoogleAd seems to have been removed.
  // 2021-04-13
  //
  // Nevermind I'm dumb it's still there whoops.
  // 2021-05-03

  //includes: "/editor/startjs/",
  //find: "d20ext.showGoogleAd();",
  //patch: 'window.d20ext.seenad = !0, $("#loading-overlay").find("div").hide(), window.currentPlayer && d20.Campaign.pages.length > 0 && d20.Campaign.handlePlayerPageChanges(), void $.get("/editor/startping/true");'

  mods: [
    {
      includes: "/editor/startjs",
      find: `$(document).on("ready", function() { d20ext.showGoogleAd(); });`,
      patch: `d20ext.seenad = true; /* replaced */ `,
    },
  ],
};
