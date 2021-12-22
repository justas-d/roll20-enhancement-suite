import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  id: "seenadOverride",
  name: "seenadOverride",
  description: "",
  category: VTTES.Module_Category.misc,
  gmOnly: false,
  force: true,

  mods: [
    {
      includes: "/editor/startjs",
      find: `$(document).on("ready", function() { d20ext.showGoogleAd(); });`,
      patch: `d20ext.seenad = true; /* replaced */ `,
    },
  ],
};
