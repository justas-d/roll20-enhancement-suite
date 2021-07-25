import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from "../../utils/ConfigViews";

export default MakeConfig(__dirname, {
    id: "nightMode",
    name: "Force Background Color",
    description: "Force a certain background. The night mode is deprecated in favor of RedReign's Dark Theme.",

    urls: {
        "You can find it here": "https://openuserjs.org/scripts/Pharonix/Roll20_Dark/source"
    },

    category: Category.canvas,

    configView: {
        backgroundColor: {
            display: "Background Color",
            type: ConfigViews.Color,
        },
    },

    config: {
        backgroundColor: [13,14,15],
        enabled: false,
    },
});
