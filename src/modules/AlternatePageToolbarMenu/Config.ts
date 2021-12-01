import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
  id: "alternativePageToolbarMenu",
  name: "Alternative Page Toolbar Menu",
  description: "Replaces the default page toolbar menu with a more concise one. Right clicking the name of the page will enable you to edit it. Vivaldi users: double right-click to edit name.",
  category: Category.canvas,

  media: {
    "page_toolbar.png": "Alternative page toolbar menu on the right side."
  },

  configView: {
    opacity: {
      type: ConfigViews.Slider,
      display: "Opacity",

      sliderMin: 0,
      sliderMax: 1
    },

    location: {
      type: ConfigViews.Dropdown,
      display: "Location",

      dropdownValues: {
        right: "Right",
        left: "Left"
      }
    }
  },

  config: {
    opacity: 1,
    location: "right"
  },

  mods: [
    /*
    { // multi-axis drag
      "includes": "vtt.bundle.js",
      "find": `e",axis:"x"`,
      "patch": `e"`
    },

    { // multi-axis drag
      "includes": "vtt.bundle.js",
      "find": `,axis:"x"}).addTouch()`,
      "patch": `}).addTouch()`
    },

    { // no tooltips in toolbar
      "includes": "vtt.bundle.js",
      "find": `<div class='pictos duplicate showtip' title='Duplicate Page'>;</div><div class='pictos settings showtip' title='Page Settings'>y</div></div>`,
      "patch": `<div class='pictos duplicate'>;</div><div class='pictos settings'>y</div></div>`
    }
    */
  ]
});
