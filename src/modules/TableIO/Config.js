import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import Vars from './Vars';

export default MakeConfig(__dirname, {
    id: "importExportTable",
    name: "Table Importer/Exporter",
    description: "Provides rollable table importing and exporting. Supports TableExport format tables. Controls can be found in the \"Collection\" sidebar tab.",
    category: Category.exportImport,
    gmOnly: true,
    media: {
        "table_io.png": "Collection sidebar widget."
    },

    mods: [
        { // add table id to popup
            includes: "assets/app.js",
            find: `this.$el.on("click",".deleterollabletable"`,
            patch: `this.el.setAttribute("${Vars.TableIdAttribute}", this.model.get("id")),this.$el.on("click",".deleterollabletable"`,
        }
    ]
});
