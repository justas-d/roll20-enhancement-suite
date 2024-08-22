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
      includes: "vtt.bundle",
      stencils: [
        {
          search_from: "nextTurn(){",
          find: [ `splice(0,1);`,1,`.push(`,-1,`[0]);` ],
          replace: [
            0, `if(window.r20es && window.r20es.selectInitiativeToken) {window.r20es.selectInitiativeToken(`,1,`[0]);}`
          ],
        },
      ],
    },
  ],
}
