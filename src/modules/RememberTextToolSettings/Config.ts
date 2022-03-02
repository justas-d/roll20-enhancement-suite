import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "rememberTextToolSettings",
  name: "Remember Text Tool Settings",
  description: "Remembers the last used settings for the text tool.",
  category: VTTES.Module_Category.canvas,
  gmOnly: false,

  config: {
    copyTextSettingsOnSelect: false,
    color: "rgb(0,0,0)",
    size: 16,
    font: "Arial",
  },

  configView: {
    copyTextSettingsOnSelect: {
      display: "Mirror selected text settings?",
      type: VTTES.Config_View_Type.Checkbox,
    },

    color: {
      display: "Current Text Color",
      type: VTTES.Config_View_Type.Text,
    },

    size: {
      display: "Current Text Size",
      type: VTTES.Config_View_Type.Number,
    },

    font: {
      display: "Current Text Font",
      type: VTTES.Config_View_Type.Text,
    },
  },

  mods: [
    {
      includes: "vtt.bundle.js",
      stencils: [
        // NOTE(justasd): search for d20.engine.editText = function
        // 2022-01-19
        {
          search_from: "d20.engine.editText=function",
          // matches $("#font-size").val(le).trigger("keyup"), $("#font-color").val(we).trigger("change-silent"), $("#font-family").val(me);
          // 2022-02-24
          find: [ `.get("stroke");`,1,`const` ],
          replace: [ `.get("fill"); 
if((window.r20es && window.r20es.copyTextSettingsOnSelect) || !window.r20es) { 
`,1,`
}
var `,
          ]
        },
        {
          search_from: `"fontSize",parseInt`,
          search_from_index_offset: -1000,
          

          // $("body").on("shape_selected","#editor",(A,p)=>{p.type=="text"
          find: [ `$("body").on("shape_selected","#editor",(`,3,`,`,4,`)=>{`,4,`.type=="text"` ],
          replace: [
            `$("body").on("shape_selected","#editor",(`,3,`,`,4,`)=>{if((window.r20es && window.r20es.copyTextSettingsOnSelect) || !window.r20es)`,4,`.type=="text"`,
          ]
        }
      ],
    },
  ]
};
