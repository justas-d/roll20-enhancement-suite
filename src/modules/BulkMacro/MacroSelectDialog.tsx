import {DOM} from "../../utils/DOM";
import {DialogBase} from "../../utils/DialogBase";
import {Dialog, DialogBody, DialogFooter, DialogFooterContent, DialogHeader} from "../../utils/DialogComponents";
import { ISlimMacro, TableOfMacrosByCategoryAndId  } from './Types';

export default class MacroSelectDialog extends DialogBase<string> {
    private macros: TableOfMacrosByCategoryAndId;

    public constructor() {
        super(undefined, {maxWidth: "20%"});
    }

    private reset() {
        this.macros = undefined;
    }

    public show(macros: TableOfMacrosByCategoryAndId) {
        this.macros = macros;
        super.internalShow();
    }

    private buttonClick = (e) => {
        e.stopPropagation();

        this.setData(e.target.getAttribute("data-r20es-macro-action"))
        this.close();
    }

    protected render() {
        console.log(this.macros);

        const elems = [];
        for (const category in this.macros) {
            const bucket = this.macros[category];

            const macroElems = []
            for (const id in bucket) {
                let macro = bucket[id];

                macroElems.push(
                    <button className="r20btn btn" data-r20es-macro-action={macro.action} onClick={this.buttonClick}>
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

                <DialogBody>
                    {elems}
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent >
                        <input style={{boxSizing: "border-box", width: "100%"}} className="r20btn btn" type="button" onClick={this.close} value="Close" />
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>

        );
    }
}
