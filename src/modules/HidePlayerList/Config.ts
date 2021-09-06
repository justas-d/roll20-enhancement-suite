import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "hidePlayerList",
    name: `Hide Player List`,
    description: `Hides the player list.`,
    category: Category.canvas,
    gmOnly: false,

    config: {
        enabled: false
    }
});
