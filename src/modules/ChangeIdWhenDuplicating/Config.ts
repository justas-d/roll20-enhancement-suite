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

      find_replace: [
        {
          // NOTE(justasd): search for CharacterEditorView =
          // 2022-01-19
          find: `b.defaulttoken=A.model._blobcache.defaulttoken`,

          replace: `b.defaulttoken = ((window.r20es && window.r20es.replaceIdOnDupe) ? window.r20es.replaceIdOnDupe(A, u) : i.model._blobcache.defaulttoken)`,

          stability_checks: [
            // NOTE(justasd): search for CharacterEditorView =
            // 2022-01-19
            `setTimeout(()=>{let h=u.get("attrorder");`
          ],
        },
      ],
    },
  ],
};
