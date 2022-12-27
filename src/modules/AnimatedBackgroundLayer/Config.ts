import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "animatedBackground",
  name: "Animated Background",
  description: "Displays an animated background if the GM has one set up for the page. Setup can be found in the top-right corner, look for a orange film button.",
  category: VTTES.Module_Category.canvas,
  gmOnly: false,

  media: {
    "animated_bg.webm": "Setup & usage"
  },

  config: {
    muteAudio: false,
    audioVolume: 0.1,
    video_history: []
  },

  configView: {
    muteAudio: {
      display: "Mute Audio?",
      type: VTTES.Config_View_Type.Checkbox
    },

    audioVolume: {
      display: "Audio Volume",
      type: VTTES.Config_View_Type.Slider,
      sliderMin: 0,
      sliderMax: 1,
    }
  },

  mods: [
    {
      includes: "vtt.bundle.js",

      find_replace: [
        //{ 
        //  // :AnimatedBackgroundAABug
        //  find: `x.beginPath(),x.lineWidth=1;`,
        //  replace: `x.beginPath(),x.lineWidth=1+(1/d20.engine.canvasZoom);`,
        //},
        //{
        //  find: `new l.Engine(nt);`,
        //  replace: `new l.Engine(nt,true);`,
        //},

        //{
        //  find: `b.updateDynamicTexture`,
        //  replace: `debugger;b.updateDynamicTexture`,
        //},

        //{
        //  find: `b.updateDynamicTexture(this._texture,I,o===null?!0:o,!1,this._format)`,
        //  replace: `debugger;b.updateDynamicTexture(this._texture,I,o===null?!0:o,!1,this._format)`,
        //},

        //{
        //  find: `pt.D.prototype._renderViews=function(){`,
        //  replace: `pt.D.prototype._renderViews=function(){debugger;`,
        //},
        
        //{
        //  find: `_renderLoop(){`,
        //  replace: `_renderLoop(){debugger;`,
        //},

        //{
        //  find: `gl.clearColor(`,
        //  replace: `gl.clearColor(0,0,0,0),console.log(`,
        //},

        //{
        //  find: `(0,_engine_babylonSetup__WEBPACK_IMPORTED_MODULE_53__.i$)()`,
        //  replace: `(window.r20es.manual_composite != null ? window.r20es.manual_composite() : (0,_engine_babylonSetup__WEBPACK_IMPORTED_MODULE_53__.i$)())`,
        //},

        //{
        //  find: `tt=new l.HtmlElementTexture("canvasTexture",Ve`,
        //  replace: `tt=new l.HtmlElementTexture("canvasTexture", null`,
        //},
      ],

      stencils: [
        {
          find: [ `d20.engine.setZoom=(`,2,`,` ],
        },

        {
          find: [ `updateCanvasZoom:()=>d20.engine.canvasZoom=`,1,`.canvasZoom` ],

          replace: [ `updateCanvasZoom:()=> {
            if(window.r20es && window.r20es.onZoomChange) {
              window.r20es.onZoomChange(`,2,`);
            }
            d20.engine.canvasZoom = `,1,`.canvasZoom;
          }`, ],
        },

        {
          search_from: `requestAnimationFrame(d20.engine.renderLoop)`,
          search_from_index_offset: -4000,

          find: [ `(0,_engine_babylonSetup__WEBPACK_IMPORTED_MODULE`,3,`)()}` ],
          replace: [ `(window.r20es.manual_composite != null ? window.r20es.manual_composite() : (0,_engine_babylonSetup__WEBPACK_IMPORTED_MODULE`,3,`)())}` ],
        },
      ]
    }
  ]
};
