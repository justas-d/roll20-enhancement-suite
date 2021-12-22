import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "transparentPaperDivs",
  name: "Transparent Canvas UI Dialogs",
  description: "Provides a way to set the opacity of floating UI dialogs.",
  category: VTTES.Module_Category.canvas,
  gmOnly: false,

  media: {
    "transparent_dialog.png": "A transparent edit token dialog."
  },

  configView: {
    opacity: {
      display: "Opacity",
      type: VTTES.Config_View_Type.Slider,

      sliderMin: 0,
      sliderMax: 1,
    },
  },

  config: {
    opacity: 1,
  },
};
