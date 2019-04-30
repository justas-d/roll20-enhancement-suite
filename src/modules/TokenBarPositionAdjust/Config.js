import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "tokenBarPositionAdjust",
    name: "Token Bar & Status Adjustments",
    description: "Allows adjusting how bars & status icons are displayed on tokens.",
    category: Category.token,

    media: {
        "adjusted_token_bar.png": "Bars of a token on the bottom of the token.",
    },

    mods: [
        {
            includes: "assets/app.js",
            find: `this._drawBars(e)`,
            patch: `eval("if(window.r20es.barDraw) { window.r20es.barDraw(e, this); } else { this._drawBars(e) }")`,
        },
        {
            includes: "assets/app.js",
            find: `this._positionAndScaleStatusIcons(i,n.length),e.save(),`,
            patch: `
if(window.r20es.statusDraw) { 
    if(!window.r20es.statusDraw(e, this, n, i)) { 
        return;
    } 
} 
else { 
    this._positionAndScaleStatusIcons(i,n.length);
    e.save();
}
`
        }
    ],

    configView: {
        idle_status_icon_opacity: {
            display: "Idle status icon alpha (when the token is not selected)",
            type: ConfigViews.Slider,
            sliderMin: 0,
            sliderMax: 1,
        },
        active_status_icon_opacity: {
            display: "Selected status icon alpha",
            type: ConfigViews.Slider,
            sliderMin: 0,
            sliderMax: 1,
        },
        position_status_icons_outside_the_token: {
            display: "Place the status icons outside of the token.",
            type: ConfigViews.Checkbox,
        },
        draw_bars_at_the_bottom: {
            display: "Draw bars at the bottom",
            type: ConfigViews.Checkbox,
        }
    },

    config: {
        idle_status_icon_opacity: 1,
        active_status_icon_opacity: 1,
        position_status_icons_outside_the_token: false,
        draw_bars_at_the_bottom: false
    }
});
