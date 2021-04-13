import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
  id: "hideTipsyPopup",
  name: "Hide Stuck Top-Left Tipsy Popups",
  description: `Prevents a tooltip from being stuck at the top-left of the screen. Should only be toggled when needed as this will hide other tooltips. Made by Pharonix.`,
  category: Category.misc,
  gmOnly: false,

  media: {
    "tipsy_popup.png": "Hides this thing."
  },

  config: {
    enabled: false,
  }
});

