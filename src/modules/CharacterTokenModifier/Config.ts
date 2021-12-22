import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "characterTokenModifier",
  name: "Character Token Editor",
  description: "Adds a tab to character sheets that provides a quick way to create and modify character tokens.",
  category: VTTES.Module_Category.token,
  gmOnly: false,

  media: {
    "token_editor.png": "The editor being used to view a Adult Brass Dragon token."
  }
};
