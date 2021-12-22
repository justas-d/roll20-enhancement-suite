import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "macroIO",
  name: "Player Macro Importer/Exporter",
  description: "Allows exporting and importing of player macros and the macro bar. Controls can be found in the \"Collection\" sidebar tab.",
  category: VTTES.Module_Category.exportImport,
  gmOnly: false,

  media: {
    "macro_io.png": "Collection sidebar widget"
  }
}
