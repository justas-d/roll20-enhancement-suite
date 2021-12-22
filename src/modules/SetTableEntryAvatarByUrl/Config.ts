import Vars from './Vars';

import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "setTableEntryAvatarByUrl",
  name: "Set Rollable Table Avatar By Url",
  description: "Allows setting the images/avatars of rollable table entries by an image url.",
  category: VTTES.Module_Category.misc,
  gmOnly: false,
  media: {
    "table_entry_by_url.png": "Use this button in the table entry dialog."
  },

  mods: [
    { // add table entry && table ids to popup
      includes: "vtt.bundle.js",
      find: `y.$el.is(":visible")&&y.render()}),this.$el.on("click",".deleteitem"`,
      patch: `y.$el.is(":visible")&&y.render()}),this.el.setAttribute("${Vars.TABLE_ID_ATTRIBUTE}", y.model.collection.rollabletable.id),this.el.setAttribute("${Vars.TABLE_ENTRY_ID_ATTRIBUTE}", y.model.id),this.$el.on("click",".deleteitem"`,
    },
  ]
};


