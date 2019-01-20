import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "rollAndApplyHitDice",
    name: "Roll & Apply Hit Dice",
    description: `Adds a "Hit Dice" option to the canvas token context menu which will roll and apply hit dice for the selected group of tokens.`,
    category: Category.token,
    gmOnly: true,
    media: {
        "hit_dice.webm": "Rolling & Applying hit dice for a single token then a group of 3."
    },

    configView: {
        diceFormulaAttribute: {
            display: "Hit dice formula attribute",
            type: ConfigViews.Text,
        },
        bar: {
            display: "HP Bar",
            type: ConfigViews.Dropdown,

            dropdownValues: {
                bar1: "Bar 1",
                bar2: "Bar 2",
                bar3: "Bar 3"
            },
        },
        diceFormulaMacro: {
            display: "(Optional) Custom Roll. All inline rolls will be summed.",
            type: ConfigViews.Text
        }
    },

    config: {
        diceFormulaAttribute: "npc_hpformula",
        bar: "bar3",
        diceFormulaMacro: "",
    }
});

