import { DialogBase } from "../../tools/DialogBase";
import { Dialog, DialogHeader, DialogFooter, DialogFooterContent, DialogBody, CheckboxWithText } from "../../tools/DialogComponents";
import { DOM } from "../../tools/DOM";
import { IApplyableMacroData } from "../../tools/MacroIO";

type FilterTableType = { [id: number]: boolean };

export default class PickMacros extends DialogBase<FilterTableType> {

    private macros: IApplyableMacroData[];

    public show(macros: IApplyableMacroData[]) {
        this.macros = macros;
        super.internalShow();
    }

    public submit = (e: any) => {
        e.stopPropagation();

        let isNotFilteredAt: FilterTableType = {};

        $(this.getRoot()).find("input").each((index, input: any) => {
            isNotFilteredAt[index] = !input.checked;
        });

        this.setData(isNotFilteredAt);
        this.close(true);
    }

    private onToggleAll = (e: any) => {
        e.stopPropagation();

        $(this.getRoot()).find("input").each((_: any, input: any) => {
            input.checked = !input.checked;
        });
    }

    protected render(): HTMLElement {

        const macroElements = [];
        for (const macro of this.macros) {
            macroElements.push(
                <tr>
                    <th scope="row">
                        <CheckboxWithText
                            checkboxText={macro.attributes.name}
                            checked
                        />
                    </th>
                    <td className="r20es-code">{macro.attributes.action}</td>
                </tr>
            );
        }

        return (
            <Dialog>
                <DialogHeader>
                    <h2>Select Macros</h2>
                </DialogHeader>

                <hr />

                <DialogBody>
                    <button className="btn" onClick={this.onToggleAll}>Toggle All</button>

                    <table className="r20es-indent">
                        <thead>
                            <tr className="table-head">
                                <th scope="col">Name</th>
                                <th scope="col">Macro</th>
                            </tr>
                        </thead>

                        <tbody>
                            {macroElements}
                        </tbody>
                    </table>

                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button className="btn" onClick={this.close}>Close</button>
                        <button className="btn" style={{ float: "right" }} onClick={this.submit}>OK</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog> as any
        );
    }
}
