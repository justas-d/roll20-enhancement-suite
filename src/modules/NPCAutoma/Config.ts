import {ADJUSTABLE_AUTMOMA_SPEED_CONFIG_KEY, GENERATE_VALUES_CONFIG_KEY, HEALTH_BAR_CONFIG_KEY} from "./Constants";
import TransformDirname  from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
    filename: TransformDirname(__dirname),
    id: "NPCAutoma",
    name: "Automate NPC turns",
    description: "Automates the play of NPC-NPC fighting interactions, including movement, attacks, damage, and token removal. Play will pause when it is either a player character's turn or a token gets within a player character's reach. This does not support NPC-NPC advantage/disadvantage, but the NPC must be setup to 'Always Roll Advantage' and 'Auto Roll Damage & Crit' in the character sheet. Also provides an option to generate defaults for these parameters in the Journal menu, assigning the character to be either an enemy or ally. Uses the following attributes:",
    category: VTTES.Module_Category.initiative,
    gmOnly: true,
    bulletList: [
        "'npc' (int) from the character sheet - set to 1 for NPCs to be controlled by the automa",
        "'npc_ac' (int) from the character sheet - used to evaluate against attacks",
        "'ally' (int) from the character sheet - set to 1 for ally NPCs",
        "'npc_speed' (int) from the character sheet - specifies the distance the token can move (assumes 5ft squares)",
        "'npc_attacks' (int) from the character sheet - the number of attacks the NPC can make",
        "'barx_value' token attribute - used for health/damage, see the 'HP Bar' config below",
        "a character action for each npc_attacks - called by index"
    ],
    media: {
        "automa.webm": "Automated NPC Battling"
    },
    mods: [
        {
            includes: "vtt.bundle.js",
            stencils: [
                {
                    search_from: "nextTurn(){",
                    find: [ `splice(0,1);`,1,`.push(`,-1,`[0]);` ],
                    replace: [
                        0, `if(window.r20es && window.r20es.npcAutoma) {window.r20es.npcAutoma(`,1,`[0]);}`
                    ],
                },
            ],
        },
        {
            includes: "vtt.bundle.js",
            stencils: [
                {
                    search_from: "data-action-type=showtoplayers",
                    find: [ `const `,-1,`=`,1,`.attr("data-itemid")` ],
                },
                {
                    find: [ `$("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"` ],
                    replace: [`
                        $("#journalitemmenu ul").on(mousedowntype, "li[data-action-type=r20esmakeAlly]", function () {
                            if(window.r20es && window.r20es.onJournalMakeAlly) window.r20es.onJournalMakeAlly(`,1,`.attr("data-itemid"))
                        }),
                        $("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=r20esmakeEnemy]",function () {
                            if(window.r20es && window.r20es.onJournalMakeEnemy) window.r20es.onJournalMakeEnemy(`,1,`.attr("data-itemid"))
                        }),
                        $("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"`,
                    ]
                }
            ],
        },
    ],

    configView: {
        [ADJUSTABLE_AUTMOMA_SPEED_CONFIG_KEY]: {
            type: VTTES.Config_View_Type.Slider,
            display: "Automa Speed",
            sliderMin: .25,
            sliderMax: 4
        },
        autoNext: {
            type: VTTES.Config_View_Type.Checkbox,
            display: "Allow the automa to proceed to the next NPC turn when a player character is not involved."
        },
        showMove: {
            type: VTTES.Config_View_Type.Checkbox,
            display: "Shows Movement arrows when moving NPCs"
        },
        npcCrit: {
            type: VTTES.Config_View_Type.Checkbox,
            display: "Allows NPCs to critically hit/damage each other"
        },
        [GENERATE_VALUES_CONFIG_KEY]: {
            type: VTTES.Config_View_Type.Checkbox,
            display: "Add buttons to generate default values for Ally and Enemy NPCs to the Journal Context Menu"
        },
        [HEALTH_BAR_CONFIG_KEY]: {
            display: "HP Bar",
            type: VTTES.Config_View_Type.Dropdown,
            dropdownValues: {
                bar1_value: "Bar 1",
                bar2_value: "Bar 2",
                bar3_value: "Bar 3"
            }
        }
    },
    config: {
        autoNext: true,
        showMove: true,
        [ADJUSTABLE_AUTMOMA_SPEED_CONFIG_KEY]: 1,
        [GENERATE_VALUES_CONFIG_KEY]: true,
        npcCrit: true,
        [HEALTH_BAR_CONFIG_KEY]: "bar3_value",
    }
};
