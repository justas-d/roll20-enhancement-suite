import MakeConfig from "../MakeConfig";
import Category from "../Category";

export default MakeConfig(__dirname,{
  id: "autoPingNextToken",
  name: "Ping Visible Token",
  description: "When advancing initiative, this module will automatically ping the next token only if it is in the player token layer.",
  category: Category.initiative,
  gmOnly: true,
  media: {
    "ping_token.webm": "Automated pinging"
  },

  mods: [
    {
      includes: "assets/app.js",
      find: "e.push(t[0]);",
      patch: "e.push(t[0]);if(window.r20es && window.r20es.pingInitiativeToken) {window.r20es.pingInitiativeToken(e[0]);}"
    },
  ],
});
