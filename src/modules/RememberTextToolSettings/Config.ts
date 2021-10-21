import MakeConfig from '../MakeConfig';
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
  id: "rememberTextToolSettings",
  name: "Remember Text Tool Settings",
  description: "Remembers the last used settings for the text tool.",
  category: Category.canvas,

  config: {
    copyTextSettingsOnSelect: false,
    color: "rgb(0,0,0)",
    size: 16,
    font: "Arial",
  },

  configView: {
    copyTextSettingsOnSelect: {
      display: "Mirror selected text settings?",
      type: ConfigViews.Checkbox,
    },

    color: {
      display: "Current Text Color",
      type: ConfigViews.Text,
    },

    size: {
      display: "Current Text Size",
      type: ConfigViews.Number,
    },

    font: {
      display: "Current Text Font",
      type: ConfigViews.Text,
    },
  },


  mods: [
    {
      includes: "assets/app.js",
      find: `"text"==t.type&&($("#font-size").val(t.model.get("font_size"))`,
      patch: `if((window.r20es && window.r20es.copyTextSettingsOnSelect) || !window.r20es) >>R20ES_MOD_FIND>>`,
    },
    {
      includes: "assets/app.js",
      find: `$("#font-size").val(o).trigger("keyup"),$("#font-color").val(l).trigger("change-silent"),$("#font-family").val(s);`,
      patch: `if((window.r20es && window.r20es.copyTextSettingsOnSelect) || !window.r20es) { >>R20ES_MOD_FIND>> }`,
    }
  ]
});


