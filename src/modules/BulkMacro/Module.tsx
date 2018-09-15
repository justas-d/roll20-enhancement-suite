import {R20Module} from "../../tools/R20Module"
import {R20} from '../../tools/R20';
import {DialogBase} from "../../tools/DialogBase";
import {DialogHeader, DialogBody, DialogFooter, Dialog, DialogFooterContent} from "../../tools/DialogComponents";
import {TokenContextMenu} from '../../tools/TokenContextMenu';
import MacroSelectDialog from './MacroSelectDialog';
import {ISlimMacro, TableOfMacrosByCategoryAndId} from './Types';
import {Macro} from 'roll20';

class BulkMacroModule extends R20Module.OnAppLoadBase {

    private selectDialog: MacroSelectDialog;

    public constructor() {
        super(__dirname);
    }

    private onDialogClose = (e) => {
        const action = this.selectDialog.getData();
        if (!action) return;

        const sel = R20.getSelectedTokens();
        R20.unselectTokens();

        const cfg = this.getHook().config;

        const rollForObj = (obj) => {
            R20.selectToken(obj);
            R20.say(action);
        };

        const cleanup = () => {

            R20.hideTokenRadialMenu();
            R20.hideTokenContextMenu();

            if (cfg.reselectAfter) {
                for (let obj of sel) {
                    R20.addTokenToSelection(obj);
                }
            }
        };

        if (cfg.delayBetweenRolls === 0) {

            for (const obj of sel) {
                rollForObj(obj);
            }

            cleanup();

        } else {
            let waited = cfg.delayBetweenRolls;

            for (let i = 0; i < sel.length; i++) {
                setTimeout(() => {
                    rollForObj(sel[i]);

                    const isLastObj = i + 1 === sel.length;
                    if (isLastObj) {
                        cleanup();
                    }

                }, waited);

                waited += cfg.delayBetweenRolls;
            }
        }
    };

    private bulkMacroButtonClicked = (e) => {

        let macros: TableOfMacrosByCategoryAndId = {};

        const addMacro = (macro: Macro, category: string) => {
            if (!(category in macros)) macros[category] = {};
            let cat = macros[category][macro.get<string>("id")] = {
                name: macro.get("name"),
                action: macro.get("action")
            };
        };

        const player = R20.getCurrentPlayer();
        const sel = R20.getSelectedTokens();

        for (let macro of player.macros.models) {
            addMacro(macro, "Player Macros");
        }

        const chars = sel
            .reduce((accum, obj) => {

                if (!obj.model) {
                    accum.uniq++;
                    return accum;
                }

                const id: string = obj.model.character
                    ? obj.model.character.get("id")
                    : obj.model.get("id");

                if (!(id in accum.map)) {
                    accum.uniq++;
                    accum.map[id] = true;

                    if (obj.model.character) {
                        accum.arr.push(obj.model.character);
                    }
                }
                return accum;
            }, {map: {}, arr: [], uniq: 0});

        if (chars.uniq === 1 && chars.arr.length > 0) {
            for (let macro of chars.arr[0].abilities.models) {
                addMacro(macro, "Token Macros");
            }
        }

        console.log(macros);
        this.selectDialog.show(macros);
    }

    public setup() {
        if (!R20.isGM()) return;

        this.selectDialog = new MacroSelectDialog();
        this.selectDialog.getRoot().addEventListener("close", this.onDialogClose);

        TokenContextMenu.addButton("Roll Bulk Macro", this.bulkMacroButtonClicked, {
            mustHaveSelection: true
        });
    }

    public dispose() {
        if (this.selectDialog) this.selectDialog.dispose();

        super.dispose();
        TokenContextMenu.removeButton("Roll Bulk Macro", this.bulkMacroButtonClicked)
    }
}

if (R20Module.canInstall()) new BulkMacroModule().install();
