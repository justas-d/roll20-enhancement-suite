import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "characterTokenModifier",
    name: "Character Token Modifier",
    description: "Provides a quick way to create and modify character default tokens.",
    category: Category.token,
});
