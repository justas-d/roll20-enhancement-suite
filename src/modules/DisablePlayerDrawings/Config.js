import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "disablePlayerDrawing",
    name: "Disable Player Drawing",
    description: "Disables the drawing/text tools for certain players. Only the GM needs to have the extension installed for this to work.",
    category: Category.canvas,
    gmOnly: true,

    media: {
        "disable_drawing.png": "Disable/Enable drawing permission button"
    }
});
