import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "jukeboxIO",
    name: "Jukebox Importer/Exporter",
    description: "Allows exporting and importing of jukebox playlists. Controls can be found in the \"Jukebox\" sidebar tab.",
    category: Category.exportImport,
});
