import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "createFinalPageLoadEvent",
  name: "createFinalPageLoadEvent",
  description: "",
  category: VTTES.Module_Category.misc,
  gmOnly: false,
  force: true,

  mods: [
    {
      includes: "vtt.bundle.js",
      find: `$("#loading-overlay").hide()`,
      patch: `$("#loading-overlay").hide();if(window.r20es && window.r20es.onLoadingOverlayHide) window.r20es.onLoadingOverlayHide(); `
    },
  ],
};
