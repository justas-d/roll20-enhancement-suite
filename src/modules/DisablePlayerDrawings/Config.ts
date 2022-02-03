import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),

  id: "disablePlayerDrawing",
  name: "Disable Player Drawing",
  description: "Disables the drawing/text tools for certain players. Only the GM needs to have the extension installed for this to work. WARNING: This will load all pages in your game and may cause performance issues or loading slowdowns.",
  category: VTTES.Module_Category.canvas,
  gmOnly: true,

  media: {
    "disable_drawing.png": "Disable/Enable drawing permission button"
  },

  config: {
    enabled: false,
  }
};
