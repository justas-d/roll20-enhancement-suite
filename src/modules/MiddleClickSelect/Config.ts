import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "middleClickToTokenLayer",
  name: "Mouse Click to Switch to Token Layer",
  description: "This module allows the use of mouse clicking (default mouse3/scroll wheel) on a token. Doing so will switch the current edit layer to the layer of the token.",
  category: VTTES.Module_Category.canvas,
  gmOnly: true,

  media: {
    "middle_click.webm": "Middle-clicking on a token in the GM layer with select token option on when the current edit is player tokens ."
  },

  configView: {
    select: {
      display: "Also select token",
      type: VTTES.Config_View_Type.Checkbox
    },

    switchToGmLayer: {
      display: "Allow switching to tokens in the GM layer.",
      type: VTTES.Config_View_Type.Checkbox
    },
    
    switchToTokenLayer: {
      display: "Allow switching to tokens in the player token layer.",
      type: VTTES.Config_View_Type.Checkbox
    },
    
    switchToMapLayer: {
      display: "Allow switching to tokens in the map layer.",
      type: VTTES.Config_View_Type.Checkbox
    },

    switchToLightsLayer: {
      display: "Allow switching to tokens in the lights layer",
      type: VTTES.Config_View_Type.Checkbox
    },

    switchToForegroundLayer: {
      display: "Allow switching to tokens in the betteR20 foreground layer",
      type: VTTES.Config_View_Type.Checkbox,

      onlyWhenHasB20: true,
    },

    switchToWeatherLayer: {
      display: "Allow switching to tokens in the betteR20 weather layer",
      type: VTTES.Config_View_Type.Checkbox,

      onlyWhenHasB20: true,
    },

    switchToBackgroundLayer: {
      display: "Allow switching to tokens in the betteR20 background layer",
      type: VTTES.Config_View_Type.Checkbox,

      onlyWhenHasB20: true,
    },

    modAlt: {
      display: "Must hold down the ALT key",
      type:   VTTES.Config_View_Type.Checkbox
    },

    modShift: {
      display: "Must hold down the SHIFT key",
      type:   VTTES.Config_View_Type.Checkbox
    },

    modCtrl: {
      display: "Must hold down the CTRL key",
      type:   VTTES.Config_View_Type.Checkbox
    },

    modMeta: {
      display: "Must hold down the meta key",
      type:   VTTES.Config_View_Type.Checkbox
    },

    mouseButtonIndex: {
      display: "Mouse button index",
      type:   VTTES.Config_View_Type.MouseButtonIndex
    },
  },

  config: {
    select: false,
    switchToGmLayer: true,
    switchToTokenLayer: true,
    switchToMapLayer: false,
    switchToLightsLayer: false,

    switchToForegroundLayer: false,
    switchToWeatherLayer: false,
    switchToBackgroundLayer: false,

    modAlt: false,
    modShift: false,
    modCtrl: false,
    modMeta: false,
    mouseButtonIndex: 1,
  },

  mods: [
    {
      includes: "vtt.bundle",
      
      stencils: [
        {

          find: [ `Mousetrap.bind("o",()=>(`,1,`("objects",!0)` ],
          replace: [ `window.r20es_set_layer = (a) => {`,1,`(a,true);}, Mousetrap.bind("o",()=>(`,1,`("objects",!0)` ],
        },
      ],
    },
  ],
};
