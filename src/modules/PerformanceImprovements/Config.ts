import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "perfImprovements",
  name: "Performance Improvements",
  description: "Attempts to improve performance.",
  category: VTTES.Module_Category.misc,
  gmOnly: false,

  config: {
    disable_frame_recorder: true
  },

  configView: {
    disable_frame_recorder: {
      display: "Disable Renderer Profiler (if present)",
      type: VTTES.Config_View_Type.Checkbox,
    },
  },
};
