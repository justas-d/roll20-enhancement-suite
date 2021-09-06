import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
  id: "customPathWidth",
  name: "Custom Line Widths",
  description: "Allows you to set a custom line width for drawing.",
  category: Category.canvas,
  gmOnly: false
});
