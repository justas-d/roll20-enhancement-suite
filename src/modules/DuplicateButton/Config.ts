import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "duplicateInJournalContextMenu",
  name: `"Duplicate" in the Journal Context Menu`,
  description: `Adds a "Duplicate" entry, functioning as a shortcut to duplicate button found in the edit page of sheets, to the context menu of items found in the journal.`,
  category: VTTES.Module_Category.journal,
  gmOnly: true,

  media: {
    "duplicate.png": "The duplicate button"
  },

  mods: [
    {
      includes: "vtt.bundle",

      stencils: [
        {
          search_from: "data-action-type=showtoplayers",
          find: [ `const `,-1,`=`,1,`.attr("data-itemid")` ],
        },

        {
          find: [ `$("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"` ],

          replace: [`
            $("#journalitemmenu ul").on(mousedowntype, "li[data-action-type=r20esduplicate]", function () {
              if(window.r20es && window.r20es.onJournalDuplicate) window.r20es.onJournalDuplicate(`,1,`.attr("data-itemid"))
            }),
            $("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"`,
          ]
        }
      ],
    },
  ]
}
