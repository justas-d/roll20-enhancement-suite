import { DialogBase } from "../../tools/DialogBase";
import { Dialog, DialogHeader, DialogFooter, DialogFooterContent, DialogBody } from "../../tools/DialogComponents";
import { DOM } from "../../tools/DOM";

type SelectedButtonsTable = { [id: string]: number };

export default class DuplicateResolveDialog<T> extends DialogBase<SelectedButtonsTable> {
    private selectedButtons: SelectedButtonsTable = {};
    private dataSet: { [id: string]: T[] };
    private descRetriever: (data: T) => string;

    public show(dataSet: { [id: string]: T[] }, descRetriever: (data: T) => string) {
        this.dataSet = dataSet;
        this.selectedButtons = {};
        this.descRetriever = descRetriever;
        for(const key in this.dataSet) this.selectedButtons[key] = 0;
        
        super.internalShow();
    }

    private submit = (e: any) => {
        e.stopPropagation();
        this.setData(this.selectedButtons);
        this.close(true);
    }

    private checkboxLogic = (target: HTMLInputElement) => {
        const key = target.getAttribute("data-key");
        const index = parseInt(target.getAttribute("data-index"));

        this.selectedButtons[key] = index;
        this.rerender();
    }

    private checkboxCheck = (e: any) => this.checkboxLogic(e.target);

    private onTextClick = (e: any) => {
        const cb = $(e.target).find("input")[0];
        if (!cb) return;

        this.checkboxLogic(cb);
    }

    private genDiffs = () => {
        let diffs = [];

        for (const key in this.dataSet) {
            const dataArray = this.dataSet[key];
            if(dataArray.length <= 1) continue;

            const text = [];

            dataArray.forEach((data: T, index: number) => {
                const isChecked = this.selectedButtons[key] === index;
                const elem = (
                    <div style={{ paddingTop: "0px", paddingBottom: "0px" }} onClick={this.onTextClick} className="r20es-code">
                        <input
                            className="btn"
                            style={{ verticalAlign: "middle", marginRight: "4px" }}
                            data-key={key}
                            data-index={index}
                            onChange={this.checkboxCheck}
                            type="radio"
                            checked={isChecked}
                        />
                        {this.descRetriever(data)}
                    </div>
                );
                text.push(elem);
            });

            diffs.push(
                <div>
                    <h4>{key}</h4>
                    {text}
                    <hr />
                </div>
            );
        }

        return diffs;

    }

    protected render(): HTMLElement {
        return (
            <Dialog>
                <DialogHeader>
                    <h2>Duplicates</h2>
                </DialogHeader>

                <hr />

                <DialogBody>
                    <p>Abilities with duplicate names were generated.</p>
                    <p>Choose which duplicate ability should be kept.</p>
                </DialogBody>

                <hr />

                <DialogBody>
                    {this.genDiffs()}
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button style={{ boxSizing: "border-box", width: "100%" }} className="btn" onClick={this.submit}>Done</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog> as any
        );
    }
}
