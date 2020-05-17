import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "counterTokenName",
    name: "Add Counter to Token Names",
    description: `Adds an increasing number to the name of all selected tokens.`,
    category: Category.token,
    gmOnly: true,
});

