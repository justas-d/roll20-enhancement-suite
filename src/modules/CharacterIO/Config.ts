import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "characterImportExport",
  name: "Journal Importer/Exporter",
  description: "Provides character, handout and character component (i.e weapons, spells, items etc) importing and exporting (in the journal and on sheets).",
  category: VTTES.Module_Category.exportImport,
  gmOnly: false,

  media: {
    "char_import.png": "Journal widget",
    "sheet_export.png": "Sheet tab",
  },

  mods: [
    {
      includes: "vtt.bundle",

      find_replace: [
        {
          find: `<button class='broadcasthandout btn'>Show to Players</button>`,
          replace: `<button class='vttes_overwrite_handout btn' style='position: absolute; top: 10px; right: 316px'>Overwrite</button><button class='vttes_export_handout btn' style='position: absolute; top: 10px; right: 250px'>Export</button> >>R20ES_MOD_FIND>>`,
        },

        {
          find: `$("body").on("click",".broadcasthandout",`,
          replace: `
          $("body").on("click",".vttes_overwrite_handout", (e) => {
            if(window.r20es && window.r20es.overwrite_handout) {
              window.r20es.overwrite_handout(e);
            }
          }), $("body").on("click",".vttes_export_handout", (e) => {
            if(window.r20es && window.r20es.export_handout) {
              window.r20es.export_handout(e);
            }
          }), >>R20ES_MOD_FIND>>`,
        }
      ]
    },
  ],
};
