import {RULER_NORMAL, RADIUS_MODE_BURST, BOX_MODE_BURST, CONE_MODE_FLAT, LINE_MODE_TOTAL_WIDTH} from "./Constants";

import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "extraRulers",
  name: "Extra Rulers",
  description: "Adds radius, box, thick line and cone ruler options. Other players need to have VTTES installed to see them.",
  category: VTTES.Module_Category.canvas,
  gmOnly: false,

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

      stencils: [
        {
          find: [ `function setMode(`, 1, `){` ],
          replace: [ 0, `window.d20setMode=setMode; if(window.r20es && window.r20es.extra_ruler_set_mode) {window.r20es.extra_ruler_set_mode(`, 1, `);}` ],
        },

        // search for d20.engine.getDistanceInScale({
        // G = function(B, H, J, ee, q, W)
        {
          search_from: "[-10.16,-24.53]",
          search_from_index_offset: -700,
          find: [ `;var `,-1,`=function(`,2,`,`,3,`,`]
        },

        {
          find: [ `y:[0,1]};` ],
          replace: [ 0, `if(window.r20es && window.r20es.render_extra_rulers) { window.r20es.render_extra_rulers(`,2,`,`,3,`); }` ],
        },

        // NOTE(justasd): search for d20.engine.drawMeasurements =
        // 2022-01-19
        {
          search_from: "d20.engine.drawMeasurements=function",
          find: [ `,x:`,4,`.x-d20.engine.currentCanvasOffset[0],`],
          replace: [ 0,`
vttes_radius_mode: `,4,`.vttes_radius_mode,
vttes_box_mode: `,4,`.vttes_box_mode,
vttes_cone_mode: `,4,`.vttes_cone_mode,
vttes_cone_degrees: `,4,`.vttes_cone_degrees,
vttes_line_mode: `,4,`.vttes_line_mode,
vttes_line_width: `,4,`.vttes_line_width,
vttes_ruler_mode: `,4,`.vttes_ruler_mode,`
          ],
        },

        {
          // NOTE(justasd): will replace two occurances.
          // NOTE(justasd): search for diagonals % 2,
          // 2022-01-19

          search_from: "[-10.16,-24.53]",
          search_from_index_offset: -1700,
          find: [ `color:`,5,`.color,flags:`,5,`.flags,` ],

          replace: [ 0,`
vttes_radius_mode: `,5,`.vttes_radius_mode,
vttes_box_mode: `,5,`.vttes_box_mode,
vttes_cone_mode: `,5,`.vttes_cone_mode,
vttes_cone_degrees: `,5,`.vttes_cone_degrees,
vttes_line_mode: `,5,`.vttes_line_mode,
vttes_line_width: `,5,`.vttes_line_width,
vttes_ruler_mode: `,5,`.vttes_ruler_mode,`
          ]
        },

        {
          find: [ `d20.engine.announceMeasure=function(`,6,`){` ],
          replace: [ 0,`
if(window.r20es && window.r20es.extra_ruler_set_mode) {
  `,6,`.vttes_radius_mode = window.r20es.extra_ruler.radius_mode;
  `,6,`.vttes_box_mode = window.r20es.extra_ruler.box_mode;
  `,6,`.vttes_cone_mode = window.r20es.extra_ruler.cone_mode;
  `,6,`.vttes_cone_degrees = window.r20es.extra_ruler.cone_degrees;
  `,6,`.vttes_line_mode = window.r20es.extra_ruler.line_mode;
  `,6,`.vttes_line_width = window.r20es.extra_ruler.line_width;
  `,6,`.vttes_ruler_mode = window.r20es.extra_ruler.ruler_mode;
}`,
          ],
        },
      ],
    },
  ]
};
