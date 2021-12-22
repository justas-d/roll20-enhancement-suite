import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),

  id: "alternativeRadialMenu",
  name: "Alternative Token Radial Menu",
  description: "Replaces the default token radial token menu with a more compact and simplistic one.",
  category: VTTES.Module_Category.canvas,
  gmOnly: false,

  media: {
    "radial.png": "Reworked radial menu",
    "radial_min.png": "Compact version"
  },

  configView: {
    opacity: {
      type: VTTES.Config_View_Type.Slider,
      display: "Opacity",

      sliderMin: 0,
      sliderMax: 1
    },

    superMinimal: {
      type: VTTES.Config_View_Type.Checkbox,
      display: "Compact mode",
    },

    auto_width: {
      type: VTTES.Config_View_Type.Checkbox,
      display: "Automatically space the left and right sides to not cover up the token."
    }
  },

  config: {
    opacity: 1,
    superMinimal: false,
    auto_width: true
  }
};
