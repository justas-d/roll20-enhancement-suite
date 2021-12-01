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
      includes: "vtt.bundle.js",
      find: `setTimeout(function(){$(d).addClass("open"),m.find(".button div.hasnumber").textfill(20)},o*30),o++`,

      patch: `;
      if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { $(d).addClass("open");m.find(".button div.hasnumber").textfill(20);}
      else { >>R20ES_MOD_FIND>>; }
      `,
    },

    { // radial final
      includes: "vtt.bundle.js",
      find: `setTimeout(function(){m.find(".button").addClass("animcomplete")},250)`,

      patch: `1;
      if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { m.find(".button").addClass("animcomplete");}
      else { >>R20ES_MOD_FIND>>; }`,
    },

    // toolbar anim
    {
      includes: "vtt.bundle.js",
      find: `g.animate({top:"-1px"},300).removeClass("closed"),`,

      patch: `g.animate({top:"-1px"},
    (window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disablePageToolbar")) ? 1 : 300,
  ).removeClass("closed"),`,
    },

    // toolbar anim
    {
      includes: "vtt.bundle.js",
      find: `g.animate({top:\`-\${g.height()}px\`},300,()=>{g.addClass("closed"),$("#page-toolbar .pages").hide(),_.delay(()=>{$("#page-toolbar .pages input:text").trigger("blur")})})`,

      patch: `g.animate({top:"-"+g.height()+"px"},
    (window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disablePageToolbar")) ? 1 : 300,
    function(){g.addClass("closed"),$("#page-toolbar .pages").hide(),_.delay(function(){$("#page-toolbar .pages input").trigger("blur")})})`,
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
