import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from "../../tools/ConfigViews";

export default MakeConfig(__dirname, {
    id: "nightMode",
    name: "Night Mode",
    description: "Activates the dark night style. WARNING: some sheets might clash with the style changes resulting in ugly sheets.",
    category: Category.canvas,

    media: {
        "night_mode.png": "The night style in action."
    },

    configView: {
        overrideBackground: {
            display: "Force the canvas background to be black?",
            type: ConfigViews.Checkbox,
        }
    },

    config: {
        overrideBackground: true,
        enabled: false,
    },
});
