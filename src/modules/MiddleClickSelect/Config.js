import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../tools/ConfigViews';

export default MakeConfig(__dirname,{
    id: "middleClickToTokenLayer",
    name: "Middle Click to Switch to Token Layer",
    description: "This module allows the use of middle clicking (mouse3/scroll wheel) on a token. Doing so will switch the current edit layer to the layer of the token.",
    category: Category.canvas,
    gmOnly: true,
    media: {
        "middle_click.webm": "Middle-clicking on a token in the GM layer with select token option on when the current edit is player tokens ."
    },

    configView: {
        select: {
            display: "Also select token",
            type: ConfigViews.Checkbox
        },

        switchToGmLayer: {
            display: "Allow switching to tokens in the GM layer.",
            type: ConfigViews.Checkbox
        },

        
        switchToTokenLayer: {
            display: "Allow switching to tokens in the player token layer.",
            type: ConfigViews.Checkbox
        },

        
        switchToMapLayer: {
            display: "Allow switching to tokens in the map layer.",
            type: ConfigViews.Checkbox
        },

        switchToLightsLayer: {
            display: "Allow switching to tokens in the lights layer",
            type: ConfigViews.Checkbox
        },

        modAlt: {
            display: "Must hold down the ALT key",
            type:   ConfigViews.Checkbox
        },

        modShift: {
            display: "Must hold down the SHIFT key",
            type:   ConfigViews.Checkbox
        },

        modCtrl: {
            display: "Must hold down the CTRL key",
            type:   ConfigViews.Checkbox
        },

        modMeta: {
            display: "Must hold down the meta key",
            type:   ConfigViews.Checkbox
        },

        mouseButtonIndex: {
            display: "Mouse button index",
            type:   ConfigViews.MouseButtonIndex
        },
    },

    config: {
        select: false,
        switchToGmLayer: true,
        switchToTokenLayer: true,
        switchToMapLayer: false,
        switchToLightsLayer: false,
        modAlt: false,
        modShift: false,
        modCtrl: false,
        modMeta: false,
        mouseButtonIndex: 1,
    }
});
