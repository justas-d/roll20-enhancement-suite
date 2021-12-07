import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "changeRepresentsIdWhenDuplicating",
    name: `Reassign "Represents" when duplicating`,
    description: "When duplicating a character in the journal and if that character has a default token, this module will reassign the \"Represents\" value of that default token to the newly duplicated character.",
    category: Category.token,
    gmOnly: true,

    mods: [
      {
        includes: "vtt.bundle.js",
        find: `u.defaulttoken=i.model._blobcache.defaulttoken`,
        patch: `u.defaulttoken = ((window.r20es && window.r20es.replaceIdOnDupe) ? window.r20es.replaceIdOnDupe(i, d) : i.model._blobcache.defaulttoken)`
      },
    ],
})
