import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

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
        },

        auto_width: {
            type: ConfigViews.Checkbox,
            display: "Automatically space the left and right sides to not cover up the token."
        }
    },

    config: {
        opacity: 1,
        superMinimal: false,
        auto_width: true
    }
});
