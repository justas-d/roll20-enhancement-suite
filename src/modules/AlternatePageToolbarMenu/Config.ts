import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "alternativePageToolbarMenu",
  name: "Alternative Page Toolbar Menu",
  description: "Replaces the default page toolbar menu with a more concise one. Right clicking the name of the page will enable you to edit it. Vivaldi users: double right-click to edit name.",
  category: VTTES.Module_Category.canvas,
  gmOnly: false,

  media: {
    "page_toolbar.png": "Alternative page toolbar menu on the right side."
  },

  configView: {
    opacity: {
      type: VTTES.Config_View_Type.Slider,
      display: "Opacity",

      sliderMin: 0,
      sliderMax: 1
    },

    location: {
      type: VTTES.Config_View_Type.Dropdown,
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
};
