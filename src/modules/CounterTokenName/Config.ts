import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
  id: "counterTokenName",
  name: "Token Counter",
  description: `Adds an option to the token right-click menu that will add an increasing counter to the name of all selected tokens. Submitted by OLStefan.`,
  category: Category.token,
  gmOnly: true,
});

