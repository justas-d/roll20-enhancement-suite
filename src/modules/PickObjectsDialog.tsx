import {DialogBase} from "../utils/DialogBase";
import {CheckboxWithText, Dialog, DialogBody, DialogFooter, DialogFooterContent, DialogHeader} from "../utils/DialogComponents";
import {ImportStrategy} from "./ImportStrategy";
import { DOM } from "../utils/DOM";

type FilterTableType = { [id: number]: boolean };

export default class PickObjectsDialog<T> extends DialogBase<FilterTableType> {


    private data: T[];
    private importStrategies: ImportStrategy[];
    private selectedStrategy: ImportStrategy;
    private nameGetter: (d: T) => string;
    private descGetter: (d: T) => string;
    private title: string;
    private continueCallback: (data: T[], strategy?:ImportStrategy) => void;

    public constructor(className?: string) {
        super(className);
    }

    public show(title: string, 
                data: T[], 
                nameGetter: (d: T) => string, 
                descGetter: (d: T) => string,
                importStrategies: ImportStrategy[],
                continueCallback: (data: T[], strategy?:ImportStrategy) => void) {
        this.title = title;
        this.data =data;
        this.nameGetter = nameGetter;
        this.descGetter = descGetter;
        this.continueCallback = continueCallback;
        this.importStrategies = importStrategies;
        this.selectedStrategy = undefined;
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

        this.continueCallback(finalData, this.selectedStrategy);
    };

    private onToggleAll = (e: any) => {
        e.stopPropagation();

        $(this.getRoot()).find("input").each((_: any, input: any) => {
            input.checked = !input.checked;
        });
    };

    private updateStrategy = (e: any, f?:any, g?:any) => {
        e.stopPropagation();
        this.selectedStrategy = e.target.value;
    }

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

                <DialogBody>
                    <button className="btn" onClick={this.onToggleAll}>Toggle All</button>
                    {this.importStrategies &&
                    <span>On duplicate name in import:
                        <select className="btn" onChange={this.updateStrategy}>
                            <option value={ImportStrategy.ADD}>Add the duplicate</option>
                            <option value={ImportStrategy.UPDATE_FIRST_MATCH}>Update first existing macro with matching name</option>
                        </select>
                    </span>
                    }

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
                        <button className="btn btn-primary" style={{ float: "right" }} onClick={this.submit}>OK</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog> as any
        );
    }
}
