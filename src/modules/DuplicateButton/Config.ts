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
      includes: "vtt.bundle.js",
      find: `$("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"`,

      patch: `
        $("#journalitemmenu ul").on(mousedowntype, "li[data-action-type=r20esduplicate]", function () {
          if(window.r20es && window.r20es.onJournalDuplicate) window.r20es.onJournalDuplicate(i.attr("data-itemid"))
        }),
        $("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"`,

      stability_checks: [
        // NOTE(justasd): search for showtoplayers
        // 2022-01-19
        `var u=i.attr("data-itemid")`,
      ],
    },
  ]
}
