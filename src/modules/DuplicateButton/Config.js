import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "duplicateInJournalContextMenu",
    name: `"Duplicate" in the Journal Context Menu`,
    description: `Adds a "Duplicate" entry, functioning as a shortcut to duplicate button found in the edit page of sheets, to the context menu of items found in the journal.`,
    category: Category.journal,
    gmOnly: true,
    media: {
        "duplicate.png": "The duplicate button"
    },

    includes: "assets/app.js",
    find: `$("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"`,

    patch: `
      $("#journalitemmenu ul").on(mousedowntype, "li[data-action-type=r20esduplicate]", function () {
        if(window.r20es && window.r20es.onJournalDuplicate) window.r20es.onJournalDuplicate(a.attr("data-itemid"))
      }),
      $("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"`
});
