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
        }
    },

    config: {
        select: false,
    }
});
