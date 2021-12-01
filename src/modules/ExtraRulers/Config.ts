import MakeConfig from '../MakeConfig';
import Category from '../Category';
import {RULER_NORMAL, RADIUS_MODE_BURST, BOX_MODE_BURST, CONE_MODE_FLAT, LINE_MODE_TOTAL_WIDTH} from "./Constants";

export default MakeConfig(__dirname, {
  id: "extraRulers",
  name: "Extra Rulers",
  description: "Adds radius, box, thick line and cone ruler options. Other players need to have VTTES installed to see them.",
  category: Category.canvas,

  media: {
    "extra_rulers.png": "Two of the extra rulers.",
  },

  config: {
    radius_mode: RADIUS_MODE_BURST,
    box_mode: BOX_MODE_BURST,
    cone_mode: CONE_MODE_FLAT,
    cone_degrees: 1.0 * (180.0/3.14159265359), /* 1 rad -> deg */
    line_mode: LINE_MODE_TOTAL_WIDTH,
    line_width: 5,
    ruler_mode: RULER_NORMAL,
  },

  mods: [
    {
      includes: "vtt.bundle.js",
      find: `function setMode(n){`,
      patch: `>>R20ES_MOD_FIND>>{window.d20setMode=setMode;}`,
    },

    {
      includes: "vtt.bundle.js",
      find: `y:[0,1]};`,
      patch: `>>R20ES_MOD_FIND>>if(window.r20es && window.r20es.render_extra_rulers) { window.r20es.render_extra_rulers(w,S); }`,
    },

    {
      includes: "vtt.bundle.js",
      find: "function setMode(n){",
      patch: ">>R20ES_MOD_FIND>>if(window.r20es && window.r20es.extra_ruler_set_mode) {window.r20es.extra_ruler_set_mode(n);}",

    },

    {
      includes: "vtt.bundle.js",
      //find: "x:t.x-d20.engine.currentCanvasOffset[0]",
      find: "x:S.x-d20.engine.currentCanvasOffset[0],",
      patch: `
vttes_radius_mode: S.vttes_radius_mode,
vttes_box_mode: S.vttes_box_mode,
vttes_cone_mode: S.vttes_cone_mode,
vttes_cone_degrees: S.vttes_cone_degrees,
vttes_line_mode: S.vttes_line_mode,
vttes_line_width: S.vttes_line_width,
vttes_ruler_mode: S.vttes_ruler_mode,
>>R20ES_MOD_FIND>>
`,
    },

    // NOTE(justasd): will replace two occurances.
    {
      includes: "vtt.bundle.js",
      //find: "color:t.color,flags:t.flags,",
      find: "color:S.color,flags:S.flags,",
      patch: `
vttes_radius_mode: S.vttes_radius_mode,
vttes_box_mode: S.vttes_box_mode,
vttes_cone_mode: S.vttes_cone_mode,
vttes_cone_degrees: S.vttes_cone_degrees,
vttes_line_mode: S.vttes_line_mode,
vttes_line_width: S.vttes_line_width,
vttes_ruler_mode: S.vttes_ruler_mode,
>>R20ES_MOD_FIND>>
`,
    },
    {
      includes: "vtt.bundle.js",
      find: "d20.engine.announceMeasure=function(w){",
      patch: `>>R20ES_MOD_FIND>>
if(window.r20es && window.r20es.extra_ruler_set_mode) {
  w.vttes_radius_mode = window.r20es.extra_ruler.radius_mode;
  w.vttes_box_mode = window.r20es.extra_ruler.box_mode;
  w.vttes_cone_mode = window.r20es.extra_ruler.cone_mode;
  w.vttes_cone_degrees = window.r20es.extra_ruler.cone_degrees;
  w.vttes_line_mode = window.r20es.extra_ruler.line_mode;
  w.vttes_line_width = window.r20es.extra_ruler.line_width;
  w.vttes_ruler_mode = window.r20es.extra_ruler.ruler_mode;
}
`,
    },



  ]
});

