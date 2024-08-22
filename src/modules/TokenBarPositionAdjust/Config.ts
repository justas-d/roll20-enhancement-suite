import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "tokenBarPositionAdjust",
  name: "Token Status Display Adjustments",
  description: "Allows adjusting how status icons are displayed on tokens.",
  category: VTTES.Module_Category.token,
  gmOnly: false,

  media: {
    "adjusted_token_status.png": "Idle & opaque status icons displayed outside of the token.",
  },

  mods: [
    {
      includes: "vtt.bundle",
      stencils: [
        {
          // this._positionAndScaleStatusIcons(t,b.length),d.save(),
          find: [ `},this._icon_defaults);this._positionAndScaleStatusIcons(`,1,`,`,2,`.length),`,3,`.save(),`, ],
          replace: [ 
`},this._icon_defaults);
if(window.r20es && window.r20es.statusDraw) { 
  if(!window.r20es.statusDraw(`,3,`, this, `,2,`, `,1,`)) { 
    return;
  } 
} 
else { 
  this._positionAndScaleStatusIcons(`,1,`,`,2,`.length);
  `,3,`.save();
}`        ],
        },
      ],
    },
  ],

  configView: {
    idle_status_icon_opacity: {
      display: "Idle status icon alpha (when the token is not selected)",
      type: VTTES.Config_View_Type.Slider,
      sliderMin: 0,
      sliderMax: 1,
    },
    active_status_icon_opacity: {
      display: "Selected status icon alpha",
      type: VTTES.Config_View_Type.Slider,
      sliderMin: 0,
      sliderMax: 1,
    },
    position_status_icons_outside_the_token: {
      display: "Place the status icons outside of the token.",
      type: VTTES.Config_View_Type.Checkbox,
    },
  },

  config: {
    idle_status_icon_opacity: 1,
    active_status_icon_opacity: 1,
    position_status_icons_outside_the_token: false,
  }
};
