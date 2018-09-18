import MakeConfig from "../MakeConfig";
import ConfigViews from "../../tools/ConfigViews";
import Category from "../Category";

export default MakeConfig(__dirname, {
    id: "animationDisable",
    name: "Disable Animations",
    description: "Disables animations: token radial menu opening, page toolbar menu opening/close.",
    category: Category.canvas,
    media: {
        "no_radial_anim.webm": "No token radial menu animation"
    },

    mods: [
        { // radial button proportionally timed animation
            includes: "assets/app.js",
            find: `setTimeout(function(){$(e).addClass("open"),o.find(".button div.hasnumber").textfill(20)},30*a),a++`,
            patch: `;
            if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { $(e).addClass("open");o.find(".button div.hasnumber").textfill(20);}
            else { >>R20ES_MOD_FIND>>; }`,
        },

        { // radial final
            includes: "assets/app.js",
            find: `setTimeout(function(){o.find(".button").addClass("animcomplete")},250)`,
            patch: `1;
            if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { o.find(".button").addClass("animcomplete");}
            else { >>R20ES_MOD_FIND>>; }`,
        },

        { // marker menu hide
            includes: "assets/app.js",
            find: `setTimeout(function(){p&&p.remove()},300)`,
            patch: `1;
            if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { p && p.remove(); }
            else { >>R20ES_MOD_FIND>>; }`,
        },

        { // marker menu show
            includes: "assets/app.js",
            find: `_.delay(function(){d.addClass("open")})`,
            patch: `1;
            if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { d.addClass("open"); }
            else { >>R20ES_MOD_FIND>>; }`
        },

        { // take over page toolbar animation
            includes: "assets/app.js",
            find: `page-toolbar .handle").bind(clicktype,function(e){`,
            patch: `>>R20ES_MOD_FIND>>if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disablePageToolbar")) {window.r20es.togglePageToolbar();} else `
        }
    ],

    configView: {
        disableRadial: {
            type: ConfigViews.Checkbox,
            display: "Disable token radial button menu animations"
        },

        disablePageToolbar: {
            type: ConfigViews.Checkbox,
            display: "Disable page toolbar animations"
        }
    },

    config: {
        disableRadial: false,
        disablePageToolbar: false
    },
});
