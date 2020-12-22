export default {
    id: "exposeD20",
    force: true,

    includes: "assets/app.js",
    find: `var exports=exports||{},`,
    patch: `window.d20 = d20; var exports=exports||{},`,

    expectedPatchCount: 2
};
