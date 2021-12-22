import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "sheetTabApi",
  name: "sheetTabApi",
  description: "",
  category: VTTES.Module_Category.misc,
  gmOnly: false,
  force: true,
};
