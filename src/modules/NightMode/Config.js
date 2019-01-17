import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from "../../utils/ConfigViews";

export default MakeConfig(__dirname, {
    id: "nightMode",
    name: "Force dark background",
    description: "Force a dark background",

    category: Category.canvas,

    configView: {
        overrideBackground: {
            display: "Force the canvas background to be black?",
            type: ConfigViews.Checkbox,
        },
    },

    config: {
        overrideBackground: true,
        enabled: false,
    },
});
