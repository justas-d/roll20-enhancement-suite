import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "bulkMacros",
  name: "Bulk Macros",
  description: `Adds a "Bulk Macros" option to the token right click menu which lists macros that can be rolled for the whole selection in bulk.`,
  category: VTTES.Module_Category.token,
  gmOnly: true,

  media: {
    "bulk_macro.webm": "Rolling initiative for 3 tokens at once"
  },

  configView: {
    delayBetweenRolls: {
      type: VTTES.Config_View_Type.Number,
      display: "The milliseconds that will be waited in between macro rolls for tokens. If you're having issues with API scripts, tweak this value. A good start is 100."
    },

    reselectAfter: {
      type: VTTES.Config_View_Type.Checkbox,
      display: "Reselect tokens after rolling? Disabling this might fix issues with API scripts."
    },

    performRollsSequentially: {
      type: VTTES.Config_View_Type.Checkbox,
      display: "Roll sequentially: Finish doing a roll before performing the next one. Cancelling one roll will cancel the whole batch."
    },
  },

  config: {
    delayBetweenRolls: 0,
    reselectAfter: true,
    performRollsSequentially: false,
  }
}
