import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "initiativeShortcuts",
    name: "Advance Initiative Shortcut",
    description: "Creates a shortcut for advancing (Ctrl+Right Arrow) in the initiative list.",
    category: Category.initiative,
    gmOnly: true,

});
