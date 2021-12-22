import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "nightMode",
  name: "Force Background Color",
  description: "Force a certain background. The night mode is deprecated in favor of RedReign's Dark Theme.",
  category: VTTES.Module_Category.canvas,
  gmOnly: false,

  urls: {
    "You can find it here": "https://openuserjs.org/scripts/Pharonix/Roll20_Dark/source"
  },

  configView: {
    backgroundColor: {
      display: "Background Color",
      type: VTTES.Config_View_Type.Color,
    },
  },

  config: {
    backgroundColor: [13,14,15],
    enabled: false,
  },
};
