import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  name: "Chrome Update Checker",
  id: "chromeUpdateChecker",
  description: `Automatically checks for new updates (Chrome only).`,
  category: VTTES.Module_Category.misc,
  gmOnly: false,
}
