import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "quickRemove",
    name: "Quick Remove",
    description: "Creates a dialog that allows quick removal of character abilities and player macros.",
    category: Category.journal,
});
