import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from "../../utils/ConfigViews";

export default MakeConfig(__dirname, {
    id: "nightMode",
    name: "Force dark background",
    description: "Force a dark background. The night mode is deprecated in favor of RedReign's Dark Theme.",

    urls: {
        "You can find it here": "https://github.com/RedReign/Roll20-Dark-Theme"
    },

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
