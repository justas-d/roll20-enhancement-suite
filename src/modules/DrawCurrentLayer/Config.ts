import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "activeLayerHud",
  name: "Display Current Layer on Canvas",
  description: "Displays the current edit layer and whether the select tool is active.",
  media: {
    "gm_bg.png": "GM layer identifier", 
    "map_bg.png": "Page layer identitifer",
    "tokens_bg.png": "Player token layer identifier"
  },
  category: VTTES.Module_Category.canvas,
  gmOnly: true,

  configView: {
    size: {
      type: VTTES.Config_View_Type.Number,
      display: "Size"
    },
    globalOpacity: {
      type: VTTES.Config_View_Type.Slider,
      display: "Global opacity",
      sliderMin: 0,
      sliderMax: 1,
    },
    showNotSelecting: {
      type: VTTES.Config_View_Type.Checkbox,
      display: "Show \"Not selecting!\" when the current tool is not the select tool?"
    },
    notSelectingOpacity: {
      type: VTTES.Config_View_Type.Slider,
      display: "\"Not selecting\" box opacity",
      sliderMin: 0,
      sliderMax: 1,
    },
    backgroundOpacity: {
      type: VTTES.Config_View_Type.Slider,
      display: "Background opacity",
      sliderMin: 0,
      sliderMax: 1,
    },

    textFillOpacity: {
      type: VTTES.Config_View_Type.Slider,
      display: "Text shadow opacity",
      sliderMin: 0,
      sliderMax: 1,
    },

    textFillColor: {
      type: VTTES.Config_View_Type.Color,
      display: "Text shadow color"
    },

    textOutlineOpacity: {
      type: VTTES.Config_View_Type.Slider,
      display: "Text outline opacity",

      sliderMin: 0,
      sliderMax: 1,
    },

    textOutlineColor: {
      type: VTTES.Config_View_Type.Color,
      display: "Text outline color"
    },

    corner: {
      type: VTTES.Config_View_Type.Dropdown,
      display: "Position",

      dropdownValues: {
        bottomRight: "Bottom Right",
        bottomLeft: "Bottom Left",
        topRight: "Top Right",
        topLeft: "Top Left"
      }
    }
  },

  config: {
    size: 26,
    showNotSelecting: true,
    notSelectingOpacity: 1,
    globalOpacity: 0.75,
    backgroundOpacity: 1,
    textFillOpacity: 1,
    textFillColor: [255, 255, 255],
    textOutlineOpacity: 1,
    textOutlineColor: [0, 0, 0],
    corner: "bottomRight"
  },

  mods: [
    {
      includes: "vtt.bundle.js",

      stencils: [
        {
          find: [ `}setMode(`,1,`){` ],
          replace: [ 0, `if(window.r20es && window.r20es.setModePrologue) {window.r20es.setModePrologue(`,1,`);}` ],
        },
      ],
    },
  ],
};
