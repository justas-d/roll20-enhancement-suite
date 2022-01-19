import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "changeRepresentsIdWhenDuplicating",
  name: `Reassign "Represents" when duplicating`,
  description: "When duplicating a character in the journal and if that character has a default token, this module will reassign the \"Represents\" value of that default token to the newly duplicated character.",
  category: VTTES.Module_Category.token,
  gmOnly: true,

  mods: [
    {
      includes: "vtt.bundle.js",
      // NOTE(justasd): search for CharacterEditorView =
      // 2022-01-19
      find: `b.defaulttoken=A.model._blobcache.defaulttoken`,

      patch: `b.defaulttoken = ((window.r20es && window.r20es.replaceIdOnDupe) ? window.r20es.replaceIdOnDupe(A, d) : i.model._blobcache.defaulttoken)`,

      stability_checks: [
        // NOTE(justasd): search for CharacterEditorView =
        // 2022-01-19
        `setTimeout(()=>{let h=d.get("attrorder");`,
      ],
    },
  ],
};
