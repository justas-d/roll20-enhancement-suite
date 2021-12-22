import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "counterTokenName",
  name: "Token Counter",
  description: `Adds an option to the token right-click menu that will add an increasing counter to the name of all selected tokens. Submitted by OLStefan.`,
  category: VTTES.Module_Category.token,
  gmOnly: true,
};
