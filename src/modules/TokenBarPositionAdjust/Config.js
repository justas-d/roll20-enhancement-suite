import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "tokenBarPositionAdjust",
    name: "Draw Bars at the Bottom",
    description: "Draws bars 1/2/3 at the bottom of the token instead of on the top.",
    category: Category.token,

    media: {
        "adjusted_token_bar.png": "Bars of a token on the bottom of the token.",
    },

    mods: [
        {
            includes: "assets/app.js",
            find: `this._drawBars(e)`,
            patch: `eval("if(window.r20es.barDraw) { window.r20es.barDraw(e, this); } else { this._drawBars(e) }")`,
        }

    ],
});
