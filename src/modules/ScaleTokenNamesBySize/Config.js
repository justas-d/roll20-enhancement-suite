import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from "../../utils/ConfigViews";

export default MakeConfig(__dirname, {
    id: "scaleTokenNamesBySize",
    name: `Scale Token Names By Size`,
    description: `Scales canvas token names proportionally by their size. Smaller tokens display smaller names while larger ones have large names.`,
    category: Category.canvas,

    mods: [
        {
            includes: "assets/app.js",
            find: `e.fillRect(...this._nameplate_data.position,...this._nameplate_data.size),e.fillStyle="rgb(0,0,0)",e.fillText(this._nameplate_data.name,0,this._nameplate_data.position[1]+n+this._nameplate_data.padding)`,
            patch: `window.r20es && window.r20es.prepNameplate && window.r20es.prepNameplate(this, e), >>R20ES_MOD_FIND>>`
        }
    ],

    configView: {
        widthThreshold: {
            display: "The unit width of a token. Nameplates will not be scaled when a token has this width.",
            type: ConfigViews.Number
        },

        scaleIfLarger: {
            display: "Scale nameplate if token width is larger than the unit width.",
            type: ConfigViews.Checkbox,
        },

        scaleIfSmaller: {
            display: "Scale nameplate if token is smaller than the unit width.",
            type: ConfigViews.Checkbox,
        }
    },

    config: {
        widthThreshold: 70,
        scaleIfLarger: false,
        scaleIfSmaller: true,
    }
});
