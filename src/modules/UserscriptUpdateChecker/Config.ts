import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  name: "Userscript Update Checker",
  id: "Userscript Update Checker",
  description: `Automatically checks for new updates (Userscript only).`,
  category: VTTES.Module_Category.misc,
  gmOnly: false,
};
