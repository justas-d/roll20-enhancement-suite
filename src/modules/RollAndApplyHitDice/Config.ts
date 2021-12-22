import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "rollAndApplyHitDice",
  name: "Roll & Apply Hit Dice",
  description: `Adds a "Hit Dice" option to the canvas token context menu which will roll and apply hit dice for the selected group of tokens.`,
  category: VTTES.Module_Category.token,
  gmOnly: true,

  media: {
    "hit_dice.webm": "Rolling & Applying hit dice for a single token then a group of 3."
  },

  configView: {
    diceFormulaAttribute: {
      display: "Hit dice formula attribute",
      type: VTTES.Config_View_Type.Text,
    },
    bar: {
      display: "HP Bar",
      type: VTTES.Config_View_Type.Dropdown,

      dropdownValues: {
        bar1: "Bar 1",
        bar2: "Bar 2",
        bar3: "Bar 3"
      },
    },
    diceFormulaMacro: {
      display: "(Optional) Custom Roll.",
      type: VTTES.Config_View_Type.Text
    },
    diceFormulaSumInline: {
      display: "(Optional) Custom roll: sum inline rolls. If unchecked, the value of the last inline roll will be used.",
      type: VTTES.Config_View_Type.Checkbox
    }
  },

  config: {
    diceFormulaAttribute: "npc_hpformula",
    bar: "bar3",
    diceFormulaMacro: "",
    diceFormulaSumInline: true
  }
};
