import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "macroIO",
    name: "Player Macro Importer/Exporter",
    description: "Allows exporting and importing of player macros and the macro bar. Controls can be found in the \"Collection\" sidebar tab.",
    category: Category.exportImport,
    media: {
        "macro_io.png": "Collection sidebar widget"
    }
});
