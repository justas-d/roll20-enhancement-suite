import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../tools/ConfigViews';

export default MakeConfig(__dirname, {
    id: "tokenResize",
    name: "Token Resize",
    description: `Allows you to quickly resize map tokens to fit the canvas size or to fit a specific grid size.`,
    category: Category.token,
    gmOnly: false,

    media: {
        "token_resize.webm": "Two map tokens being resized to fit the canvas."
    },

    config: {
        lastSquareWidth: 70,
        lastSquareHeight: 70,
        lastNumSquaresX: 25,
        lastNumSquaresY: 25,
    }
});

