import { createElementJsx } from '../tools/DOM.js'
import { R20Module } from "../tools/R20Module"
import { R20 } from '../tools/R20.js';
import { DialogBase } from "../tools/DialogBase";
import { DialogHeader, DialogBody, DialogFooter, Dialog, DialogFooterContent } from "../tools/DialogComponents";
import { TokenContextMenu } from '../tools/TokenContextMenu.js';

class MacroSelectDialog extends DialogBase {
    constructor() {
        super(undefined, {maxWidth: "20%"});
        this.buttonClick = this.buttonClick.bind(this);
    }

    reset() {
        this.macros = undefined;
    }

    show(data) {
        this.macros = data;
        super.show();
    }

    buttonClick(e) {
        e.stopPropagation();

        this.setData(e.target.getAttribute("data-r20es-macro-action"))
        this.close();
    }

    render() {
        console.log(this.macros);

        const elems = [];
        for (let category in this.macros) {
            const bucket = this.macros[category];

            const macroElems = []
            for (const id in bucket) {
                let macro = bucket[id];

                macroElems.push(
                    <button data-r20es-macro-action={macro.action} onClick={this.buttonClick}>
                        {macro.name}
                    </button>
                );
            }

            elems.push(<div>
                <h3>{category}</h3>
                <div className="r20es-indent">
                    {macroElems}
                </div>
            </div>);
        }

        return (
            <Dialog>
                <DialogHeader>
                    <h2>Macro selection</h2>
                </DialogHeader>

                <hr />

                <DialogBody>
                    {elems}
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <input type="button" onClick={this.close} value="Close" />
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>

        );
    }
}

class BulkMacroModule extends R20Module.OnAppLoadBase {
    constructor(id) {
        super(id);

        this.bulkMacroButtonClicked = this.bulkMacroButtonClicked.bind(this);
        this.onDialogClose = this.onDialogClose.bind(this);
    }

    onDialogClose() {
        const action = this.selectDialog.getData();
        if (!action) return;

        const sel = R20.getSelectedTokens();
        R20.unselectTokens();

        for (let obj of sel) {
            R20.selectToken(obj);
            R20.say(action);
        }

        R20.hideTokenRadialMenu();
        R20.hideTokenContextMenu();

        for (let obj of sel) {
            R20.addTokenToSelection(obj);
        }
    }

    bulkMacroButtonClicked() {

        let macros = {};

        const addMacro = (macro, category) => {
            if (!(category in macros)) macros[category] = {};
            let cat = macros[category][macro.get("id")] = {
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

                const id = obj.model.character
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
            }, { map: {}, arr: [], uniq: 0 });

        if (chars.uniq === 1 && chars.arr.length > 0) {
            for (let macro of chars.arr[0].abilities.models) {
                addMacro(macro, "Token Macros");
            }
        }

        console.log(macros);
        this.selectDialog.show(macros);
    }

    setup() {
        this.selectDialog = new MacroSelectDialog();
        this.selectDialog.getRoot().addEventListener("close", this.onDialogClose);

        TokenContextMenu.addButton("Roll Bulk Macro", this.bulkMacroButtonClicked, {
            mustHaveSelection: true
        });
    }

    dispose() {
        if (this.selectDialog) this.selectDialog.dispose();

        super.dispose();
        TokenContextMenu.removeButton("Roll Bulk Macro", this.bulkMacroButtonClicked)
    }
}

if (R20Module.canInstall()) new BulkMacroModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "bulkMacros",
    name: "Bulk macros",
    description: `Adds a "Bulk Macros" option to the token right click menu which lists macros that can be rolled for the whole selection in bulk.`,
    category: R20Module.category.token,
    gmOnly: true,
});

export { hook as BulkMacroHook }
