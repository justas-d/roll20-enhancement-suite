import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "mapIO",
    name: "Map Importer/Exporter",
    description: "Lets you export and import maps across campaigns.",
    category: Category.exportImport,

    media: {
        "map_io.png": "The Map I/O widget found in \"My Settings\""
    }

});
