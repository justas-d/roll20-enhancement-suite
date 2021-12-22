import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "customPathWidth",
  name: "Custom Line Widths",
  description: "Allows you to set a custom line width for drawing.",
  category: VTTES.Module_Category.canvas,
  gmOnly: false
};
