import MakeConfig from "../MakeConfig";
import Category from "../Category";

export default MakeConfig(__dirname,{
  id: "autoSelectNextToken",
  name: "Select Token",
  description: "When advancing initiative, this module will automatically select the next token in the initiative order.",
  category: Category.initiative,
  gmOnly: true,
  media: {
    "select_token.webm": "Automated token selection"
  },

  mods: [
    {
      includes: "vtt.bundle.js",
      find: `A.push(w[0]);`,
      patch: ">>R20ES_MOD_FIND>>if(window.r20es && window.r20es.selectInitiativeToken) { window.r20es.selectInitiativeToken(A[0]);}"
    },
  ],
});
