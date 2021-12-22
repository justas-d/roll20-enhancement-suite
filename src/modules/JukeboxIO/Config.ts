import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "jukeboxIO",
  name: "Jukebox Importer/Exporter",
  description: "Allows exporting and importing of jukebox playlists. Controls can be found in the \"Jukebox\" sidebar tab.",
  category: VTTES.Module_Category.exportImport,
  gmOnly: true,
};
