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
      includes: "vtt.bundle",

      stencils: [
        {
          search_from: `_template:$("#tmpl_charactereditor")`,
          // 1 is the new character
          // 2 is the old character
          //const c = w.model.collection.create(h);
          find: [`name}\`;const `,1,`=`,2,`.model.collection.create`],
        },
        {
          search_from: `_template:$("#tmpl_charactereditor")`,
          find: [ `model._blobcache.defaulttoken&&(`,3,`.defaulttoken=`,2,`.model._blobcache.defaulttoken` ],
          replace: [ `model._blobcache.defaulttoken&&(`,3,`.defaulttoken = (window.r20es && window.r20es.replaceIdOnDupe) ? window.r20es.replaceIdOnDupe(`,2,`, `,1,`) : `,2,`.model._blobcache.defaulttoken` ],
        }
      ]
    },
  ],
};
