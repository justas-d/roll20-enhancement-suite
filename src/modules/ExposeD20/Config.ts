import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "exposeD20",
  name: "Expose D20",
  description: "",
  category: VTTES.Module_Category.misc,
  force: true,

  mods: [
    {
      includes: "vtt.bundle.js",
      find_replace: [
        {
          find: `var exports=exports||{},`,
          replace: `window.d20 = d20; var exports=exports||{},`,
        },
        {
          // NOTE(justasd): This seems to be part of some kind of Webpack code in vtt.bundle.js.
          // If we don't remove the exception throw, it gets thrown on Chrome.
          // This was starting to cause issues starting starting on 2022-07-14 but could have been
          // there earlier. Definitely wasn't there around 2022-05-15
          //
          // Anyway, if we yeet the exception throw, things seem to be working fine. It doesn't
          // seem that the function that contains the throw even does any useful work inside of it.
          // On top of that, this seemed to cause no issues in testing.
          //
          // So yeeting this seems fine.
          //
          // 2022-07-13
          find: `if(!v)throw new Error("Automatic publicPath is not supported in this browser");`,
          replace: `if(!v)v="";`,
        },
      ],
    },
  ],
};
