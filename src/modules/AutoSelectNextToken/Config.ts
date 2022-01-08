import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "autoSelectNextToken",
  name: "Select Token",
  description: "When advancing initiative, this module will automatically select the next token in the initiative order.",
  category: VTTES.Module_Category.initiative,
  gmOnly: true,

  media: {
    "select_token.webm": "Automated token selection"
  },

  mods: [
    {
      includes: "vtt.bundle.js",
      find: `A.push(I[0]);`,
      patch: ">>R20ES_MOD_FIND>>if(window.r20es && window.r20es.selectInitiativeToken) { window.r20es.selectInitiativeToken(A[0]);}"
    },
  ],
}
