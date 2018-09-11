import { DialogBase } from "../tools/DialogBase";
import { Dialog, DialogHeader, DialogFooter, DialogFooterContent, DialogBody, CheckboxWithText } from "../tools/DialogComponents";
import { DOM } from "../tools/DOM";

type FilterTableType = { [id: number]: boolean };

export default class PickObjectsDialog<T> extends DialogBase<FilterTableType> {

    private data: T[];
    private nameGetter: (d: T) => string;
    private descGetter: (d: T) => string;
    private title: string;
    private continueCallback: (data: T[]) => void;

    public constructor() {
        super("r20es-big-dialog");
    }

    public show(title: string, 
                data: T[], 
                nameGetter: (d: T) => string, 
                descGetter: (d: T) => string,
                continueCallback: (data: T[]) => void) {
        this.title = title;
        this.data =data;
        this.nameGetter = nameGetter;
        this.descGetter = descGetter;
        this.continueCallback = continueCallback;
        super.internalShow();
    }

    public submit = (e: any) => {
        e.stopPropagation();

        let isNotFilteredAt: FilterTableType = {};

        $(this.getRoot()).find("input").each((index, input: any) => {
            isNotFilteredAt[index] = !input.checked;
        });

        this.close(true);

        const finalData = [];
        this.data.forEach((val, idx) => {
            if(isNotFilteredAt[idx]) return;
            finalData.push(val);
        });

        if(finalData.length <= 0) {
            alert("Selection is empty.");
            return;
        }
        this.continueCallback(finalData);
    };

    private onToggleAll = (e: any) => {
        e.stopPropagation();

        $(this.getRoot()).find("input").each((_: any, input: any) => {
            input.checked = !input.checked;
        });
    };

    protected render(): HTMLElement {

        const macroElements = [];
        for (const obj of this.data) {
            macroElements.push(
                <tr>
                    <th scope="row">
                        <CheckboxWithText
                            checkboxText={this.nameGetter(obj)}
                            checked
                        />
                    </th>
                    <td className="r20es-code">{this.descGetter(obj)}</td>
                </tr>
            );
        }

        return (
            <Dialog>
                <DialogHeader>
                    <h2>{this.title}</h2>
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
