import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "characterTokenModifier",
    name: "Character Token Editor",
    description: "Adds a tab to character sheeds that provides a quick way to create and modify character tokens.",
    category: Category.token,

    media: {
        "token_editor.png": "The editor being used to view a Adult Brass Dragon token."
    }
});
