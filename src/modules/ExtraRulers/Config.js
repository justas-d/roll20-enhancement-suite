import MakeConfig from '../MakeConfig';
import Category from '../Category';
import {RULER_NORMAL, RADIUS_MODE_BURST, BOX_MODE_BURST, CONE_MODE_FLAT, LINE_MODE_TOTAL_WIDTH} from "./Constants";

export default MakeConfig(__dirname, {
  id: "extraRulers",
  name: "Extra Rulers",
  description: "Adds radius, box, thick line and cone ruler options.",
  category: Category.canvas,

  media: {
    "extra_rulers.png": "Two of the extra rulers.",
  },

  config: {
    radius_mode: RADIUS_MODE_BURST,
    box_mode: BOX_MODE_BURST,
    cone_mode: CONE_MODE_FLAT,
    cone_degrees: 90,
    line_mode: LINE_MODE_TOTAL_WIDTH,
    line_width: 5,
    ruler_mode: RULER_NORMAL,
  },

  mods: [

            
    {
      includes: "assets/app.js",
      find: `function setMode(e){`,
      patch: `>>R20ES_MOD_FIND>>{window.d20setMode=setMode;}`,
    },

    {
      includes: "assets/app.js",
      find: `y:[0,1]};`,
      patch: `>>R20ES_MOD_FIND>>if(window.r20es && window.r20es.render_extra_rulers) { window.r20es.render_extra_rulers(e,t); }`,
    },
    {
      includes: "assets/app.js",
      find: "function setMode(e){",
      patch: "function setMode(e){if(window.r20es && window.r20es.extra_ruler_set_mode) {window.r20es.extra_ruler_set_mode(e);}",

    },

    {
      includes: "assets/app.js",
      find: "x:t.x-d20.engine.currentCanvasOffset[0]",
      patch: `
vttes_radius_mode: t.vttes_radius_mode,
vttes_box_mode: t.vttes_box_mode,
vttes_cone_mode: t.vttes_cone_mode,
vttes_cone_degrees: t.vttes_cone_degrees,
vttes_line_mode: t.vttes_line_mode,
vttes_line_width: t.vttes_line_width,
vttes_ruler_mode: t.vttes_ruler_mode,
>>R20ES_MOD_FIND>>
`,
    },

    // NOTE(justasd): will replace two occurances.
    {
      includes: "assets/app.js",
      find: "color:t.color,flags:t.flags,",
      patch: `
vttes_radius_mode: t.vttes_radius_mode,
vttes_box_mode: t.vttes_box_mode,
vttes_cone_mode: t.vttes_cone_mode,
vttes_cone_degrees: t.vttes_cone_degrees,
vttes_line_mode: t.vttes_line_mode,
vttes_line_width: t.vttes_line_width,
vttes_ruler_mode: t.vttes_ruler_mode,
>>R20ES_MOD_FIND>>
`,
    },
    {
      includes: "assets/app.js",
      find: "d20.engine.announceMeasure=function(e){",
      patch: `>>R20ES_MOD_FIND>>
if(window.r20es.extra_ruler_set_mode) {
  e.vttes_radius_mode = window.r20es.extra_ruler.radius_mode;
  e.vttes_box_mode = window.r20es.extra_ruler.box_mode;
  e.vttes_cone_mode = window.r20es.extra_ruler.cone_mode;
  e.vttes_cone_degrees = window.r20es.extra_ruler.cone_degrees;
  e.vttes_line_mode = window.r20es.extra_ruler.line_mode;
  e.vttes_line_width = window.r20es.extra_ruler.line_width;
  e.vttes_ruler_mode = window.r20es.extra_ruler.ruler_mode;
}
`,
    },



  ]
});

