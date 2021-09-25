import MakeConfig from "../MakeConfig";
import ConfigViews from "../../utils/ConfigViews";
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

       /*
        { // marker menu hide
            includes: "assets/app.js",
            find: `setTimeout(function(){t&&t.remove()},300)`,
            patch: `1;
            if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { t && t.remove(); }
            else { >>R20ES_MOD_FIND>>; }`,
        },
        */

      /*
        { // marker menu show
            includes: "assets/app.js",
            find: `_.delay(function(){i.addClass("open")})`,
            patch: `1;
            if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { i.addClass("open"); }
            else { >>R20ES_MOD_FIND>>; }`
        },
        */

      /*
        { // take over page toolbar animation
            includes: "assets/app.js",
            find: `page-toolbar .handle").bind(clicktype,function(e){`,
            patch: `>>R20ES_MOD_FIND>>if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disablePageToolbar")) {window.r20es.togglePageToolbar();} else `
        },
        */

      // toolbar anim
      {
        includes: "assets/app.js",
        find: `t.animate({top:"-1px"},300).removeClass("closed"),`,
        patch: `t.animate({top:"-1px"},
      (window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disablePageToolbar")) ? 1 : 300,
    ).removeClass("closed"),`,
      },

      // toolbar anim
      {
        includes: "assets/app.js",
        find: `t.animate({top:\`-\${t.height()}px\`},300,()=>{t.addClass("closed"),$("#page-toolbar .pages").hide(),_.delay(()=>{$("#page-toolbar .pages input:text").trigger("blur")})})`,
        patch: `t.animate({top:"-"+t.height()+"px"},
      (window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disablePageToolbar")) ? 1 : 300,
      function(){t.addClass("closed"),$("#page-toolbar .pages").hide(),_.delay(function(){$("#page-toolbar .pages input").trigger("blur")})})`,
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
