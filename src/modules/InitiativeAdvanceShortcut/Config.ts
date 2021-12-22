import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "initiativeShortcuts",
  name: "Advance Initiative Shortcut",
  description: "Creates a shortcut for advancing (Ctrl+Right Arrow) in the initiative list. Advanced shortcuts must be enabled for this to work. See https://wiki.roll20.net/Advanced_Shortcuts",
  category: VTTES.Module_Category.initiative,
  gmOnly: true,
}
