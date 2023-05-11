import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "arrowKeysCameraControls",
  name: "Arrow Key Camera Controls",
  description: "Allows the camera to be moved by pressing the arrow keys as long as a token is not selected",
  category: VTTES.Module_Category.canvas,
  gmOnly: false,

  mods: [
    {
      includes: "vtt.bundle.js",

      find_replace: [
        {
          find: `bind:function(Q,G,Y){`,
          replace: `bind:function(Q,G,Y) { console.log("MOUSETRAP", Q, G, Y); debugger;`,
        },
      ],
    },
  ],

};
