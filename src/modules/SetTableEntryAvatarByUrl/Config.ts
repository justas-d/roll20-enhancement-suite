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
    { 
      includes: "vtt.bundle",

      stencils: [

        // add table entry && table ids to popup
        {
          search_from: "tmpl_tableitemeditor",
          // M.$el.is(":visible")&&M.render()}),
          find: [ `()=>{`,1,`.$el.is(":visible")&&`,1,`.render()}),this.$el.on("click",".deleteitem"` ],
          replace: [ 
            `()=>{`,1,`.$el.is(":visible")&&`,1,`.render()}),this.el.setAttribute("${Vars.TABLE_ID_ATTRIBUTE}",`,1,`.model.collection.rollabletable.id),this.el.setAttribute("${Vars.TABLE_ENTRY_ID_ATTRIBUTE}",`,1,`.model.id),this.$el.on("click",".deleteitem"`
          ]
        },
      ],
    }
  ]
};


