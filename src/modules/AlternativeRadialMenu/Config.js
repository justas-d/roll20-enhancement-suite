import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../tools/ConfigViews';

export default MakeConfig(__dirname, {
    id: "alternativeRadialMenu",
    name: "Alternative Token Radial Menu",
    media: {
        "radial.png": "Reworked radial menu",
        "radial_min.png":
            "Compact version"
    },
    description: "Replaces the default token radial token menu with a more compact and simplistic one.",
    category: Category.canvas,

    configView: {
        opacity: {
            type: ConfigViews.Slider,
            display: "Opacity",

            sliderMin: 0,
            sliderMax: 1
        },

        superMinimal: {
            type: ConfigViews.Checkbox,
            display: "Compact mode",
        }
    },

    config: {
        opacity: 1,
        superMinimal: false,
    }
});
