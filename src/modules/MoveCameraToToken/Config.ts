import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname,{
  id: "autoFocusNextToken",
  name: "Move Camera to Token",
  description : "When advancing initiative, this module will move your camera to the next token in the initiative order. This camera movement is local, meaning other players will not have their camera moved.",
  category: Category.initiative,
  gmOnly: true,
  media: {
    "move_cam.webm": "Camera moving between 4 tokens"
  },

  mods: [
    {
      includes: "vtt.bundle.js",
      find: `A.push(w[0]);`,
      patch: `>>R20ES_MOD_FIND>>if(window.r20es && window.r20es.moveCameraTo) { window.r20es.moveCameraTo(A[0]); }`,
    },
  ],
});
