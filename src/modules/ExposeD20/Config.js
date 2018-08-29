export default {
    id: "exposeD20",
    force: true,

    includes: "assets/app.js",
    find: "var d20=d20||{};",
    patch: "var d20=d20||{};window.d20=d20;",
    expectedPatchCount: 2
};
