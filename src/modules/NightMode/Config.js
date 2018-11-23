import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from "../../utils/ConfigViews";

export default MakeConfig(__dirname, {
    id: "nightMode",
    name: "Night Mode (Force dark background)",
    description: "The Night Mode is being phased out in favor of Red Reign's Dark Theme",

    urls: {
        "You can find it here": "https://github.com/RedReign/Roll20-Dark-Theme"
    },

    category: Category.canvas,

    media: {
        "night_mode.png": "The night style in action."
    },

    configView: {
        overrideBackground: {
            display: "Force the canvas background to be black?",
            type: ConfigViews.Checkbox,
        },
        ogl5ESheet: {
            display: "(Deprecated) OGL D&D 5E Night Mode ",
            type: ConfigViews.Checkbox,
        },
        styleChat: {
            display: "(Deprecated) Style chat?",
            type: ConfigViews.Checkbox,
        },
        baseStyle: {
            display: "(Deprecated) Base style (disable this if you only want a dark canvas)",
            type: ConfigViews.Checkbox,
        }
    },

    config: {
        baseStyle: false,
        overrideBackground: true,
        enabled: false,
        ogl5ESheet: false,
        styleChat: false,
    },
});
