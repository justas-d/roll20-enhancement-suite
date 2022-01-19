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
      // NOTE(justasd): search for tmpl_tableitemeditor
      // 2022-01-19
      find: `T.$el.is(":visible")&&T.render()}),this.$el.on("click",".deleteitem"`,

      patch: `T.$el.is(":visible")&&T.render()}),this.el.setAttribute("${Vars.TABLE_ID_ATTRIBUTE}", T.model.collection.rollabletable.id),this.el.setAttribute("${Vars.TABLE_ENTRY_ID_ATTRIBUTE}", T.model.id),this.$el.on("click",".deleteitem"`,
    },

    // NOTE(justasd): TEMPFIX as they messed up somewhere.
    // FIXME REMOVE ASAP
    // FIXME REMOVE ASAP
    // FIXME REMOVE ASAP
    // FIXME REMOVE ASAP
    // FIXME REMOVE ASAP
    // FIXME REMOVE ASAP
    // FIXME REMOVE ASAP
    // FIXME REMOVE ASAP
    // FIXME REMOVE ASAP
    // FIXME REMOVE ASAP
    // 2022-01-19
    {
      includes: "vtt.bundle.js",
      find: `_.isFinite`,
      patch: `isFinite`,
    }
  ]
};


