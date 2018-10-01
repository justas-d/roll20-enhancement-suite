import { DialogBase } from "../../tools/DialogBase";
import isChrome from "../../tools/IsChrome";
import { Dialog, DialogHeader, DialogFooter, DialogFooterContent, DialogBody, CheckboxWithText } from "../../tools/DialogComponents";
import MacroGeneratorModule from "./Module";
import { DOM } from "../../tools/DOM";

export default class PickMacroGeneratorsDialog extends DialogBase<null> {
    private parent: MacroGeneratorModule;
    
    constructor(parent: MacroGeneratorModule) {
        super();
        this.parent = parent;
    }

    public show = this.internalShow;

    submit = (e: any, checkboxes: HTMLInputElement[]) =>  {
        this.parent.categoryFilter = checkboxes.reduce((accum, checkbox) => { accum[checkbox.value] = checkbox.checked; return accum; }, {});
        this.close(true);
        e.stopPropagation();
    }

    onTokenActionChecked = (e: any) => {
        this.parent.setIsTokenAction = e.target.checked;
        e.stopPropagation();
    }

    onSelectChange = (e: any) => {
        this.parent.activeGenerator = this.parent.generators[e.target.value];

        this.rerender();
        
        // dialog is not centered after rerendering on chrome
        if (isChrome()) {
            this.recenter();
        }

        e.stopPropagation();
    }

    generateCheckboxes() {
        let elems = [];
        let checkboxes = [];

        for (const type in this.parent.activeGenerator.actionTypes) {
            const name = this.parent.activeGenerator.actionTypes[type];

            const root = <CheckboxWithText value={type} checkboxText={name} checked /> as any;
            elems.push(root);
            checkboxes.push(root.firstElementChild);
        }

        return { elems: elems, checkboxes: checkboxes };
    }

    onToggleAll = (e: any) => {
        $(this.getRoot()).find("input").each((_: any, input: any) => { 
            if (input["ignoreToggleAll"]) return; 
            input.checked = !input.checked; 
        });
        e.stopPropagation();
    }

    public render(): HTMLElement {
        const data: any = this.parent.activeGenerator ? this.generateCheckboxes() : {};
        const checkboxDivs = data.elems;
        const checkboxes = data.checkboxes;

        const selectionOptions = [];
        {
            for(const key in this.parent.generators) {
                const gen = this.parent.generators[key];
                selectionOptions.push(<option value={gen.id}>{gen.name}</option>)
            }
        }

        return (
            <Dialog>
                <DialogHeader>
                    <h2>Sheet, category selection.</h2>
                </DialogHeader>

                <DialogBody>
                    <select value={this.parent.activeGenerator ? this.parent.activeGenerator.id : ""} onChange={this.onSelectChange}>
                        <option value="">Select a sheet</option>
                        {selectionOptions}
                    </select>

                    {checkboxDivs &&
                        <div style={{ paddingLeft: "12px", paddingBottom: "12px" }}>
                            <button className="btn" onClick={this.onToggleAll}>Toggle All</button>
                            {checkboxDivs}
                            <hr />
                            <CheckboxWithText
                                ignoreToggleAll
                                checked={this.parent.setIsTokenAction}
                                onChange={this.onTokenActionChecked}
                                checkboxText={"Show as Token Action"}
                            />
                        </div>

                    }
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button className="btn" onClick={this.close}>Close</button>
                        <button className="btn btn-primary" style={{ float: "right" }} disabled={!("elems" in data)} onClick={e => this.submit(e, checkboxes)}>OK</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog> as any
        )
    }
}
