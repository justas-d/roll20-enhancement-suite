import Vars from './Vars';

import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "importExportTable",
  name: "Table Importer/Exporter",
  description: "Provides rollable table importing and exporting. Supports TableExport format tables. Controls can be found in the \"Collection\" sidebar tab.",
  category: VTTES.Module_Category.exportImport,
  gmOnly: true,

  media: {
    "table_io.png": "Collection sidebar widget."
  },

  mods: [
    { // add table id to popup
      includes: "vtt.bundle",
      find_replace: [
        {
          find: `this.$el.on("click",".deleterollabletable"`,
          replace: `this.el.setAttribute("${Vars.TableIdAttribute}", this.model.get("id")),this.$el.on("click",".deleterollabletable"`,
        },
      ],
    }
  ]
};
