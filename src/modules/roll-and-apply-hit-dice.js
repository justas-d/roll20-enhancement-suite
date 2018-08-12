import { R20Module } from "../tools/r20Module";
import { R20 } from "../tools/r20api";
import { createElementJsx } from "../tools/createElement";
import { findByIdAndRemove } from "../tools/miscUtil";
import { TokenContextMenuApi } from "../tools/token-context-menu-module-api";

class RollAndApplyHitDiceModule extends R20Module.SimpleBase {
    constructor(id) {
        super(id);

        this.onClickMenuItem = this.onClickMenuItem.bind(this);
    }

    fancySay(msg, callback) {
        R20.sayToSelf(`&{template:default} {{name=R20ES Hit Dice}} {{${msg}}}`, callback);
    }

    onClickMenuItem(e) {
        const objects = R20.getSelectedTokens();
        const config = this.getHook().config;

        // tokens will locally disappear if we do not unselect them here
        R20.unselectTokens();

        let numRolled = 0;

        for (let token of objects) {

            if (!token.model || !token.model.character) continue;

            let attribs = token.model.character.attribs;

            // find hpForumla
            let hpFormula = null;
            for (let attrib of attribs.models) {
                if (!hpFormula && attrib.attributes.name === config.diceFormulaAttribute) {
                    hpFormula = attrib.attributes.current;
                    break;
                }
            }

            if (!hpFormula) {
                this.fancySay(`Could not find attribute ${config.diceFormulaAttribute}`);

                continue;
            }

            this.fancySay(`${token.model.character.get("name")}: [[${hpFormula}]]`, (_, o) => {
                if (!o.inlinerolls || o.inlinerolls.length <= 0) return;

                let hp = o.inlinerolls[0].results.total;

                let barValue = config.bar + "_value";
                let barMax = config.bar + "_max";
                let save = {};
                save[barValue] = hp;
                save[barMax] = hp;
                token.model.save(save);

                // reselect when we're done processing all callbacks.
                numRolled++;
                if (numRolled >= objects.length) {
                    for (let sel of objects) {
                        R20.addTokenToSelection(sel);
                    }
                }
            });
        }
    }

    setup() {
        TokenContextMenuApi.addButton("Hit Dice", this.onClickMenuItem, {
            mustHaveSelection: true
        });
    }

    dispose() {
        TokenContextMenuApi.removeButton("Hit Dice", this.onClickMenuItem);
    }
}

if (R20Module.canInstall()) new RollAndApplyHitDiceModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "rollAndApplyHitDice",
    name: "Roll and apply hit dice",
    description: `Adds a "Hit Dice" option to the token right click menu which rolls and applies hit dice for the selected tokens.`,
    category: R20Module.category.token,
    gmOnly: true,

    configView: {
        diceFormulaAttribute: {
            display: "Hit dice formula attribute",
            type: "string",
        },
        bar: {
            display: "HP Bar",
            type: "dropdown",

            dropdownValues: {
                bar1: "Bar 1",
                bar2: "Bar 2",
                bar3: "Bar 3"
            },
        }
    },

    config: {
        diceFormulaAttribute: "npc_hpformula",
        bar: "bar3",
    }
});

export { hook as rollAndApplyHitDiceHook }