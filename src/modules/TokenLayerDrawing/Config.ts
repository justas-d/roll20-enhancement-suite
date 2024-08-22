import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "tokenLayerDrawing",
  name: "Draw Token Layer on Tokens",
  description: "Draws an indicator at the bottom left of each token that indicates which layer it is on.",
  category: VTTES.Module_Category.canvas,
  gmOnly: true,
  media: {
    "token_mp.png": "A token in the map layer",
    "token_tk.png": "A token in the player token layer",
    "token_gm.png": "A token in the GM layer"
  },

  mods: [
    {
      includes: "vtt.bundle",
      stencils: [
        {
          // this._drawStatusIcons(c), c.restore(), this
          find: [
            `this._drawStatusIcons(`,1,`),`,1,`.restore(),`,
          ],
          replace: [
            `this._drawStatusIcons(`,1,`),`,1,`.restore(),(window.r20es && window.r20es.tokenDrawBg && window.r20es.tokenDrawBg(`,1,`, this)),`,
          ],
        },

      ],
    },
  ],

  configView: {
    globalAlpha: {
      display: "Global opacity",
      type: VTTES.Config_View_Type.Slider,

      sliderMin: 0,
      sliderMax: 1,
    },

    backgroundOpacity: {
      display: "Background opacity",
      type: VTTES.Config_View_Type.Slider,

      sliderMin: 0,
      sliderMax: 1,
    },

    rotateAlongWithToken: {
      display: "Rotate overlay along with token",
      type: VTTES.Config_View_Type.Checkbox
    },

    textStrokeWidth: {
      display: "Text outline width",
      type: VTTES.Config_View_Type.Number,

      numberMin: 0,
    },

    textStrokeOpacity: {
      display: "Text stroke opacity",
      type: VTTES.Config_View_Type.Slider,

      sliderMin: 0,
      sliderMax: 1,
    },

    textStrokeColor: {
      display: "Text stroke color",
      type: VTTES.Config_View_Type.Color
    },

    textFillOpacity: {
      display: "Text fill opacity",
      type: VTTES.Config_View_Type.Slider,

      sliderMin: 0,
      sliderMax: 1,
    },

    textFontSize: {
      display: "Font size",
      type: VTTES.Config_View_Type.Number,

      numberMin: 0,
    },

    textFillColor: {
      display: "Text fill color",
      type: VTTES.Config_View_Type.Color
    },

    drawOnGmLayer: {
      display: "Draw on tokens in the GM layer.",
      type: VTTES.Config_View_Type.Checkbox
    },
    
    drawOnTokenLayer: {
      display: "Draw on tokens in the player token layer.",
      type: VTTES.Config_View_Type.Checkbox
    },
    
    drawOnMapLayer: {
      display: "Draw on tokens in the map layer.",
      type: VTTES.Config_View_Type.Checkbox
    },

    drawOnLightsLayer: {
      display: "Draw on tokens in the lights layer",
      type: VTTES.Config_View_Type.Checkbox
    },

    drawOnForegroundLayer: {
      display: "Draw on tokens in the betteR20 foreground layer",
      type: VTTES.Config_View_Type.Checkbox,

      onlyWhenHasB20: true,
    },

    drawOnWeatherLayer: {
      display: "Draw on tokens in the betteR20 weather layer",
      type: VTTES.Config_View_Type.Checkbox,

      onlyWhenHasB20: true,
    },
    drawOnBackgroundLayer: {
      display: "Draw on tokens in the betteR20 background layer",
      type: VTTES.Config_View_Type.Checkbox,

      onlyWhenHasB20: true,
    }
  },

  config: {
    globalAlpha: 1,
    backgroundOpacity: 0.5,
    textStrokeWidth: 2,
    textStrokeOpacity: 1,
    textStrokeColor: [0, 0, 0],
    textFillOpacity: 1,
    textFillColor: [255, 255, 255],
    textFontSize: 18,
    rotateAlongWithToken: false,

    drawOnGmLayer: true,
    drawOnTokenLayer: true,
    drawOnMapLayer: true,
    drawOnLightsLayer: true,

    drawOnWeatherLayer: true,
    drawOnForegroundLayer: true,
    drawOnBackgroundLayer: true
  },
};
