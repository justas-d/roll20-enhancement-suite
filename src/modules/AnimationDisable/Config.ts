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
    {
      includes: "vtt.bundle",

      stencils: [

        // radial button proportionally timed animation
        {
          search_from: "*30),",
          search_from_index_offset: -300,

          // setTimeout(function(){$(t).addClass("open"),m.find(".button div.hasnumber").textfill(20)},g*30),g++
          find: [ `setTimeout(function(){$(`,1,`).addClass("open"),`,2,`.find(".button div.hasnumber").textfill(20)},`,3,`*30),`,3,`++` ],
          replace: [
`
if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { 
  $(`,1,`).addClass("open");`,2,`.find(".button div.hasnumber").textfill(20);
} 
else { 
  `,0,` 
}`,
          ]
        },

        // radial final
        {
          search_from: "*30),",

          // setTimeout(function(){m.find(".button").addClass("animcomplete")},250)
          find: [ `setTimeout(function(){`,2,`.find(".button").addClass("animcomplete")},250)` ],
          replace: [ 
`
1;
if(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disableRadial")) { 
  `,2,`.find(".button").addClass("animcomplete");
}
else { 
  `,0,` 
}`,
          ],
        },

        // toolbar anim
        {
          search_from: "if(d20.pagetoolbar.noClosing)return;",
          // ?(l.animate({top:"-1px"},300).removeClass("closed"),`
          find: [ `?(`,4,`.animate({top:"-1px"},300).removeClass("closed"),` ],
          replace: [ `?(`,4,`.animate({top:"-1px"},(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disablePageToolbar")) ? 1 : 300).removeClass("closed"),`, ],
        },

        // toolbar anim
        {
          search_from: "if(d20.pagetoolbar.noClosing)return;",
          // l.animate({top:\`-\${l.height()}px\`},300,()=>{l.addClass("closed"),$("#page-toolbar .pages").hide(),_.delay(()=>{$("#page-toolbar .pages input:text").trigger("blur")})})
          find: [ `:(`,4,`.animate({top:\`-\${`,4,`.height()}px\`},300,()=>{`,4,`.addClass("closed"),$("#page-toolbar .pages").hide(),_.delay(()=>{$("#page-toolbar .pages input:text").trigger("blur")})})` ],

          replace: [ 
`:(`,4,`.animate({top:"-"+`,4,`.height()+"px"},
(window.r20es && window.r20es.shouldDoCustomAnim && window.r20es.shouldDoCustomAnim("disablePageToolbar")) ? 1 : 300,
function(){`,4,`.addClass("closed"),$("#page-toolbar .pages").hide(),_.delay(function(){$("#page-toolbar .pages input").trigger("blur")})})`,
          ],
        },
      ],
    },
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
