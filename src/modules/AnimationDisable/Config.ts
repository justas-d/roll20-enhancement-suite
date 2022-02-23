import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "animationDisable",
  name: "Disable Animations",
  description: "Disables animations: token radial menu opening, page toolbar menu opening/close.",
  category: VTTES.Module_Category.canvas,
  gmOnly: false,

  media: {
    "no_radial_anim.webm": "No token radial menu animation"
  },

  mods: [

    { // radial button proportionally timed animation
      includes: "vtt.bundle.js",

      // NOTE(justasd): search for * 30)
      // 2022-01-19
      find: `setTimeout(function(){$(t).addClass("open"),m.find(".button div.hasnumber").textfill(20)},g*30),g++`,

      patch: `;
      if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { $(t).addClass("open");m.find(".button div.hasnumber").textfill(20);}
      else { >>R20ES_MOD_FIND>>; }
      `,
    },

    { // radial final
      includes: "vtt.bundle.js",

      // NOTE(justasd): search for * 30)
      // 2022-01-19
      find: `setTimeout(function(){m.find(".button").addClass("animcomplete")},250)`,

      patch: `1;
      if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { m.find(".button").addClass("animcomplete");}
      else { >>R20ES_MOD_FIND>>; }`,
    },

    // toolbar anim
    {
      includes: "vtt.bundle.js",
      // NOTE(justasd): search for pagetoolbar.noClosing
      // 2022-01-19
      find: `l.animate({top:"-1px"},300).removeClass("closed"),`,

      patch: `l.animate({top:"-1px"},
    (window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disablePageToolbar")) ? 1 : 300,
  ).removeClass("closed"),`,
    },

    // toolbar anim
    {
      includes: "vtt.bundle.js",
      // NOTE(justasd): search for pagetoolbar.noClosing
      // 2022-01-19
      find: `l.animate({top:\`-\${l.height()}px\`},300,()=>{l.addClass("closed"),$("#page-toolbar .pages").hide(),_.delay(()=>{$("#page-toolbar .pages input:text").trigger("blur")})})`,


      patch: `l.animate({top:"-"+l.height()+"px"},
    (window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disablePageToolbar")) ? 1 : 300,
    function(){l.addClass("closed"),$("#page-toolbar .pages").hide(),_.delay(function(){$("#page-toolbar .pages input").trigger("blur")})})`,
    }
  ],

  configView: {
    disableRadial: {
      type: VTTES.Config_View_Type.Checkbox,
      display: "Disable token radial button menu animations"
    },

    disablePageToolbar: {
      type: VTTES.Config_View_Type.Checkbox,
      display: "Disable page toolbar animations"
    }
  },

  config: {
    disableRadial: false,
    disablePageToolbar: false
  },
};
