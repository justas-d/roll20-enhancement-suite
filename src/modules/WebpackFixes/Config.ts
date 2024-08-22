import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "webpackFixes",
  name: "Webpack Fixes",
  description: "",
  category: VTTES.Module_Category.misc,
  force: true,

  mods: [
    {
      includes: "vtt.bundle",

      stencils: [
        {
          search_from: `throw new Error("Automatic publicPath is not supported in this browser");`,
          search_from_index_offset: -20,
          find: [ `if(!`,1,`)throw new Error("Automatic publicPath is not supported in this browser");` ],
          replace: [ 1,` = "https://cdn.roll20.net/production/";` ],
        },
      ],
    },
  ],
};
