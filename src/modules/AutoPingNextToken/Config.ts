import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "autoPingNextToken",
  name: "Ping Visible Token",
  description: "When advancing initiative, this module will automatically ping the next token only if it is in the player token layer.",
  category: VTTES.Module_Category.initiative,
  gmOnly: true,

  media: {
    "ping_token.webm": "Automated pinging"
  },

  mods: [
    {
      includes: "vtt.bundle",
      stencils: [
        {
          search_from: "nextTurn(){",
          find: [ `splice(0,1);`,1,`.push(`,-1,`[0]);` ],
          replace: [
            0, `if(window.r20es && window.r20es.pingInitiativeToken) {window.r20es.pingInitiativeToken(`,1,`[0]);}`
          ],
        },
      ],
    },
  ],
};
