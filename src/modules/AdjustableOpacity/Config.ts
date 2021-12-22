import {ADJUSTABLE_OPACITY_PASSIVE_GM_LAYER_CONFIG_KEY} from "./Constants";
import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "adjustableOpacity",
  name: "Adjustable GM Layer opacity",
  description: "Allows adjusting the opacity of the GM layer.",
  category: VTTES.Module_Category.canvas,
  gmOnly: true,

  configView: {
    [ADJUSTABLE_OPACITY_PASSIVE_GM_LAYER_CONFIG_KEY]: {
      type: VTTES.Config_View_Type.Slider,
      display: "GM Layer opacity",

      sliderMin: 0,
      sliderMax: 1
    },
  },

  config: {
    enabled: false,
    [ADJUSTABLE_OPACITY_PASSIVE_GM_LAYER_CONFIG_KEY]: 1,
  }
};

