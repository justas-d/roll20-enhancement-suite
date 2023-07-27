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
      find_replace: [
        {
          find: `$(document).on("ready", function() { d20ext.showGoogleAd(); });`,
          replace: `d20ext.seenad = true; d20ext.showingAds = false; d20ext.adComplete = true; /* replaced */ `,
        }
      ]
    },
  ],
};
