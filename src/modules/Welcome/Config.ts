import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  name: "Welcome",
  id: "welcomeScreen",
  description: "The welcome popup message.",
  force: true,
  forceShowConfig: true,
  gmOnly: false,
  category: VTTES.Module_Category.misc,

  configView: {
    showWelcomePopup: {
      display: "Show welcome message.",
      type: VTTES.Config_View_Type.Checkbox
    },

    showStartupGuide: {
      display: "Show startup guide",
      type: VTTES.Config_View_Type.Checkbox
    },

    showChangelog: {
      display: "Show changelog",
      type: VTTES.Config_View_Type.Checkbox
    },
  },

  config: {
    hasShownDiscordPoll: false,
    showWelcomePopup: true,
    showStartupGuide: true,
    showChangelog: true,
    previousVersion: "",
    has_shown_ui_preview_incompatibility_message: false,
  },
};
