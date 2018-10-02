import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "darkMode",
    name: "Dark Mode",
    description: "Activates the dark/night mode.",
    category: Category.canvas,
});
