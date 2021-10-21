import MakeConfig from '../MakeConfig'; import Category from '../Category';
import Vars from './Vars';

export default MakeConfig(__dirname, {
  id: "setTableEntryAvatarByUrl",
  name: "Set Rollable Table Avatar By Url",
  description: "Allows setting the images/avatars of rollable table entries by an image url.",
  category: Category.misc,
  media: {
    "table_entry_by_url.png": "Use this button in the table entry dialog."
  },

  mods: [
    { // add table entry && table ids to popup
        includes: "assets/app.js",
        find: `this.$el.on("click",".deleteitem",(()=>{`,
        patch: `this.el.setAttribute("${Vars.TABLE_ID_ATTRIBUTE}", e.model.collection.rollabletable.id),this.el.setAttribute("${Vars.TABLE_ENTRY_ID_ATTRIBUTE}", e.model.id),>>R20ES_MOD_FIND>>`,
    },
  ]
});
