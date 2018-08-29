import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../tools/ConfigViews';

export default MakeConfig(__dirname, {
    id: "activeLayerHud",
    name: "Display Current Layer on Canvas",
    description: "Displays the current edit layer and whether the select tool is active.",
    media: {
        "gm_bg.png": "GM layer identifier", 
        "map_bg.png": "Map layer identitifer", 
        "tokens_bg.png": "Player token layer identifier"
    },
    category: Category.canvas,
    gmOnly: true,

    configView: {
        size: {
            type: ConfigViews.Number,
            display: "Size"
        },
        globalOpacity: {
            type: ConfigViews.Slider,
            display: "Global opacity",
            sliderMin: 0,
            sliderMax: 1,
        },
        showNotSelecting: {
            type: ConfigViews.Checkbox,
            display: "Show \"Not selecting!\" when the current tool is not the select tool?"
        },
        notSelectingOpacity: {
            type: ConfigViews.Slider,
            display: "\"Not selecting\" box opacity",
            sliderMin: 0,
            sliderMax: 1,
        },
        backgroundOpacity: {
            type: ConfigViews.Slider,
            display: "Background opacity",
            sliderMin: 0,
            sliderMax: 1,
        },

        textFillOpacity: {
            type: ConfigViews.Slider,
            display: "Text shadow opacity",
            sliderMin: 0,
            sliderMax: 1,
        },

        textFillColor: {
            type: ConfigViews.Color,
            display: "Text shadow color"
        },

        textOutlineOpacity: {
            type: ConfigViews.Slider,
            display: "Text outline opacity",

            sliderMin: 0,
            sliderMax: 1,
        },

        textOutlineColor: {
            type: ConfigViews.Color,
            display: "Text outline color"
        },

        corner: {
            type: ConfigViews.Dropdown,
            display: "Position",

            dropdownValues: {
                bottomRight: "Bottom Right",
                bottomLeft: "Bottom Left",
                topRight: "Top Right",
                topLeft: "Top Left"
            }
        }

    },

    config: {
        size: 26,
        showNotSelecting: true,
        notSelectingOpacity: 1,
        globalOpacity: 0.75,
        backgroundOpacity: 1,
        textFillOpacity: 1,
        textFillColor: [255, 255, 255],
        textOutlineOpacity: 1,
        textOutlineColor: [0, 0, 0],
        corner: "bottomRight"
    },

    includes: "assets/app.js",
    find: "function setMode(e){",
    patch: "function setMode(e){if(window.r20es && window.r20es.setModePrologue) {window.r20es.setModePrologue(e);}",

});
