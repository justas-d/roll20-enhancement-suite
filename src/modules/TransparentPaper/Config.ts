
import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "transparentPaperDivs",
    name: "Transparent Canvas UI Dialogs",
    description: "Provides a way to set the opacity of floating UI dialogs.",
    category: Category.canvas,
    media: {
        "transparent_dialog.png": "A transparent edit token dialog."
    },

    configView: {
        opacity: {
            display: "Opacity",
            type: ConfigViews.Slider,

            sliderMin: 0,
            sliderMax: 1,
        },
    },

    config: {
        opacity: 1,
    },
});
