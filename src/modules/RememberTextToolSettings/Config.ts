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
      find: `p.type=="text"&&($("#font-size").val(p.model.get("font_size"))`,
      patch: `if((window.r20es && window.r20es.copyTextSettingsOnSelect) || !window.r20es) >>R20ES_MOD_FIND>>`,
    },

    // NOTE(justasd): search for d20.engine.editText = function
    // 2022-01-19
    {
      includes: "vtt.bundle.js",
      find: `$("#font-size").val(ve).trigger("keyup"),$("#font-color").val(he).trigger("change-silent"),$("#font-family").val(se);`,
      patch: `if((window.r20es && window.r20es.copyTextSettingsOnSelect) || !window.r20es) { >>R20ES_MOD_FIND>> }`,
    }
  ]
};
