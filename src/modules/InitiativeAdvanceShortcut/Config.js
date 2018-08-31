import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "initiativeShortcuts",
    name: "Advance Initiative Shortcut",
    description: "Creates a shortcut for advancing (Ctrl+Right Arrow) in the initiative list. Advanced shortcuts must be enabled for this to work. See https://wiki.roll20.net/Advanced_Shortcuts",
    category: Category.initiative,
    gmOnly: true,

});
