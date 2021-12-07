import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
  id: "tokenLayerDrawing",
  name: "Draw Token Layer on Tokens",
  description: "Draws an indicator at the bottom left of each token that indicates which layer it is on.",
  category: Category.canvas,
  gmOnly: true,
  media: {
    "token_mp.png": "A token in the map layer",
    "token_tk.png": "A token in the player token layer",
    "token_gm.png": "A token in the GM layer"
  },

  mods: [
    {
      includes: "vtt.bundle.js",
      find: `this._drawNameplate(d)),d.restore(),this`,
      patch: `this._drawNameplate(d)),d.restore(),(window.r20es && window.r20es.tokenDrawBg && window.r20es.tokenDrawBg(d, this)),this`,
    },
  ],

  configView: {
    globalAlpha: {
      display: "Global opacity",
      type: ConfigViews.Slider,

      sliderMin: 0,
      sliderMax: 1,
    },

    backgroundOpacity: {
      display: "Background opacity",
      type: ConfigViews.Slider,

      sliderMin: 0,
      sliderMax: 1,
    },

    rotateAlongWithToken: {
      display: "Rotate overlay along with token",
      type: ConfigViews.Checkbox
    },

    textStrokeWidth: {
      display: "Text outline width",
      type: ConfigViews.Number,

      numberMin: 0,
    },

    textStrokeOpacity: {
      display: "Text stroke opacity",
      type: ConfigViews.Slider,

      sliderMin: 0,
      sliderMax: 1,
    },

    textStrokeColor: {
      display: "Text stroke color",
      type: ConfigViews.Color
    },

    textFillOpacity: {
      display: "Text fill opacity",
      type: ConfigViews.Slider,

      sliderMin: 0,
      sliderMax: 1,
    },

    textFontSize: {
      display: "Font size",
      type: ConfigViews.Number,

      numberMin: 0,
    },

    textFillColor: {
      display: "Text fill color",
      type: ConfigViews.Color
    },

    drawOnGmLayer: {
      display: "Draw on tokens in the GM layer.",
      type: ConfigViews.Checkbox
    },
    
    drawOnTokenLayer: {
      display: "Draw on tokens in the player token layer.",
      type: ConfigViews.Checkbox
    },
    
    drawOnMapLayer: {
      display: "Draw on tokens in the map layer.",
      type: ConfigViews.Checkbox
    },

    drawOnLightsLayer: {
      display: "Draw on tokens in the lights layer",
      type: ConfigViews.Checkbox
    },

    drawOnForegroundLayer: {
      display: "Draw on tokens in the betteR20 foreground layer",
      type: ConfigViews.Checkbox,

      onlyWhenHasB20: true,
    },

    drawOnWeatherLayer: {
      display: "Draw on tokens in the betteR20 weather layer",
      type: ConfigViews.Checkbox,

      onlyWhenHasB20: true,
    },
    drawOnBackgroundLayer: {
      display: "Draw on tokens in the betteR20 background layer",
      type: ConfigViews.Checkbox,

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
});
