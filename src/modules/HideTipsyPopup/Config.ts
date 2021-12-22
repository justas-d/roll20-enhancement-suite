import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "hideTipsyPopup",
  name: "Hide Stuck Top-Left Tipsy Popups",
  description: `Prevents a tooltip from being stuck at the top-left of the screen. Should only be toggled when needed as this will hide other tooltips. Made by Pharonix.`,
  category: VTTES.Module_Category.misc,
  gmOnly: false,

  media: {
    "tipsy_popup.png": "Hides this thing."
  },

  config: {
    enabled: false,
  }
};

