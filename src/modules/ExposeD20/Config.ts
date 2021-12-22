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
      find: `var exports=exports||{},`,
      patch: `window.d20 = d20; var exports=exports||{},`,
    },
  ],
};
