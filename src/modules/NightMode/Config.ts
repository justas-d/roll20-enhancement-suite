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
      display: "Canvas Background Color",
      type: VTTES.Config_View_Type.Color,
    },
    backdrop_color: {
      display: "Backdrop Color",
      type: VTTES.Config_View_Type.Color,
    },

    only_force_if_default: {
      display: "Only force Canvas and Backdrop colors if the page has it set to default",
      type: VTTES.Config_View_Type.Checkbox,
    },
  },

  config: {
    backgroundColor: [13,14,15],
    backdrop_color: [10,11,12],
    only_force_if_default: true,
    enabled: false,
  },
};
