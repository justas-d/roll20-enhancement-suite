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
      find: `f.defaulttoken=i.model._blobcache.defaulttoken`,

      patch: `f.defaulttoken = ((window.r20es && window.r20es.replaceIdOnDupe) ? window.r20es.replaceIdOnDupe(i, u) : i.model._blobcache.defaulttoken)`,

      stability_checks: [
        `const u=i.model.collection.create(g);setTimeout(()=>{const a={};`,
      ],
    },
  ],
};
