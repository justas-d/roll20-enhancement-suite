import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from "../../utils/ConfigViews";

export default MakeConfig(__dirname, {
    id: "scaleTokenNamesBySize",
    name: `Scale Token Names By Size`,
    description: `Scales canvas token names proportionally by their size. Smaller tokens display smaller names while larger ones have large names.`,
    category: Category.canvas,

    includes: "assets/app.js",
    find: `var m=n.measureText(f).width;`,
    patch: `>>R20ES_MOD_FIND>>if(window.r20es && window.r20es.drawNameplate) window.r20es.drawNameplate(this.model, n, m, r, g, f); else `,

    configView: {
        widthThreshold: {
            display: "The unit width of a token. Nameplates will not be scaled when a token has this widt",
            type: ConfigViews.Number
        },

        scaleIfLarger: {
            display: "Scale nameplate if token width is larger than the unit width",
            type: ConfigViews.Checkbox,
        },

        scaleIfSmaller: {
            display: "Scale nameplate if token is smaller than the unit width",
            type: ConfigViews.Checkbox,
        }
    },

    config: {
        widthThreshold: 70,
        scaleIfLarger: false,
        scaleIfSmaller: true,
    }
});
