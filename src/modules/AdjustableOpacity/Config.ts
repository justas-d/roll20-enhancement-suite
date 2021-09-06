import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';
import {ADJUSTABLE_OPACITY_PASSIVE_GM_LAYER_CONFIG_KEY} from "./Constants";

export default MakeConfig(__dirname, {
    id: "adjustableOpacity",
    name: "Adjustable GM Layer opacity",
    description: "Allows adjusting the opacity of the GM layer.",
    category: Category.canvas,

    configView: {
        [ADJUSTABLE_OPACITY_PASSIVE_GM_LAYER_CONFIG_KEY]: {
            type: ConfigViews.Slider,
            display: "GM Layer opacity",

            sliderMin: 0,
            sliderMax: 1
        },
    },

    config: {
        enabled: false,
        [ADJUSTABLE_OPACITY_PASSIVE_GM_LAYER_CONFIG_KEY]: 1,
    }
});
