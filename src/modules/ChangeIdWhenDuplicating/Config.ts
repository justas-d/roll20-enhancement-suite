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
      find: `u.defaulttoken=i.model._blobcache.defaulttoken`,
      patch: `u.defaulttoken = ((window.r20es && window.r20es.replaceIdOnDupe) ? window.r20es.replaceIdOnDupe(i, d) : i.model._blobcache.defaulttoken)`,

      stability_checks: [
        `const d=i.model.collection.create(f);setTimeout(()=>{const g={};`,
      ],
    },
  ],
};
