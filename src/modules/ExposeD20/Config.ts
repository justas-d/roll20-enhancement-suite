export default {
  id: "exposeD20",
  force: true,

  mods: [
    {
      includes: "vtt.bundle.js",
      find: `var exports=exports||{},`,
      patch: `window.d20 = d20; var exports=exports||{},`,
    },
  ],
};
