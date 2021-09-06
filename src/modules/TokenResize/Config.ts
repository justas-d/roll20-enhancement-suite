import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "tokenResize",
    name: "Token Resize",
    description: `Allows you to quickly resize map tokens to fit the canvas size or to fit a specific grid size.`,
    category: Category.token,
    gmOnly: false,

    media: {
        "token_resize2.webm": "Two map tokens being resized to fit the canvas."
    },

    configView: {
        placeTopLeft: {
            type: ConfigViews.Checkbox,
            display: "Position tokens in the top-left corner after resizing"
        },

        useUnits: {
            type: ConfigViews.Checkbox,
            display: "Use map units (feet, meters, km, etc) instead of squares."
        }
    },

    config: {
        placeTopLeft: true,
        useUnits: false,
        lastSquareWidth: 70,
        lastSquareHeight: 70,
        lastNumSquaresX: 25,
        lastNumSquaresY: 25,
    }
});

