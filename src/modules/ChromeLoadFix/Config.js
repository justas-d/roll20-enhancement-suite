export default {
    id: "chromePageLoadFix",
    force: true,

    includes: "assets/app.js",
    find: `"You will join the game shortly..."),i=6e4)`,
    patch: `"You will join the game shortly..."),i=250)`,
}
