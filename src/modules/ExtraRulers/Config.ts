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
      find: `function setMode(i){`,
      patch: `>>R20ES_MOD_FIND>>{window.d20setMode=setMode;}`,
    },

    {
      includes: "vtt.bundle.js",
      find: `y:[0,1]};`,
      patch: `>>R20ES_MOD_FIND>>if(window.r20es && window.r20es.render_extra_rulers) { window.r20es.render_extra_rulers(A,k); }`,
    },

    {
      includes: "vtt.bundle.js",
      find: "function setMode(i){",
      patch: ">>R20ES_MOD_FIND>>if(window.r20es && window.r20es.extra_ruler_set_mode) {window.r20es.extra_ruler_set_mode(i);}",
    },

    {
      includes: "vtt.bundle.js",
      find: "x:k.x-d20.engine.currentCanvasOffset[0],",
      patch: `
vttes_radius_mode: k.vttes_radius_mode,
vttes_box_mode: k.vttes_box_mode,
vttes_cone_mode: k.vttes_cone_mode,
vttes_cone_degrees: k.vttes_cone_degrees,
vttes_line_mode: k.vttes_line_mode,
vttes_line_width: k.vttes_line_width,
vttes_ruler_mode: k.vttes_ruler_mode,
>>R20ES_MOD_FIND>>
`,
    },

    // NOTE(justasd): will replace two occurances.
    {
      includes: "vtt.bundle.js",
      find: "color:k.color,flags:k.flags,",
      patch: `
vttes_radius_mode: k.vttes_radius_mode,
vttes_box_mode: k.vttes_box_mode,
vttes_cone_mode: k.vttes_cone_mode,
vttes_cone_degrees: k.vttes_cone_degrees,
vttes_line_mode: k.vttes_line_mode,
vttes_line_width: k.vttes_line_width,
vttes_ruler_mode: k.vttes_ruler_mode,
>>R20ES_MOD_FIND>>
`,
    },
    {
      includes: "vtt.bundle.js",
      find: "d20.engine.announceMeasure=function(A){",
      patch: `>>R20ES_MOD_FIND>>
if(window.r20es && window.r20es.extra_ruler_set_mode) {
  A.vttes_radius_mode = window.r20es.extra_ruler.radius_mode;
  A.vttes_box_mode = window.r20es.extra_ruler.box_mode;
  A.vttes_cone_mode = window.r20es.extra_ruler.cone_mode;
  A.vttes_cone_degrees = window.r20es.extra_ruler.cone_degrees;
  A.vttes_line_mode = window.r20es.extra_ruler.line_mode;
  A.vttes_line_width = window.r20es.extra_ruler.line_width;
  A.vttes_ruler_mode = window.r20es.extra_ruler.ruler_mode;
}
`,
    },



  ]
});
