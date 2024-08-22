
import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "autoFocusNextToken",
  name: "Move Camera to Token",
  description : "When advancing initiative, this module will move your camera to the next token in the initiative order. This camera movement is local, meaning other players will not have their camera moved.",
  category: VTTES.Module_Category.initiative,
  gmOnly: true,

  media: {
    "move_cam.webm": "Camera moving between 4 tokens"
  },

  mods: [
    {
      includes: "vtt.bundle",

      stencils: [
        {
          search_from: "nextTurn(){",
          find: [ `splice(0,1);`,1,`.push(`,-1,`[0]);` ],
          replace: [
            0, `if(window.r20es && window.r20es.moveCameraTo) {window.r20es.moveCameraTo(`,1,`[0]);}`
          ],
        },
      ],
    },
  ],
};
