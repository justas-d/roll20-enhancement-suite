import { DialogBase } from "../../utils/DialogBase";
import { Dialog, DialogHeader, DialogFooter, DialogFooterContent, DialogBody, CheckboxWithText } from "../../utils/DialogComponents";
import MacroGeneratorModule from "./Module";
import { DOM } from "../../utils/DOM";
import {isChromium} from "../../utils/BrowserDetection";
import {FolderingMethod} from "./FolderingMethod";
import {copy} from "../../utils/MiscUtils";

export default class PickMacroGeneratorsDialog extends DialogBase<null> {
    private parent: MacroGeneratorModule;
    
    constructor(parent: MacroGeneratorModule) {
        super("r20es-big-dialog");
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
        if (isChromium()) {
            this.recenter();
        }

        e.stopPropagation();
    }

    generateCheckboxes() {
        let elems = [];
        let checkboxes = [];

        for(let factoryIndex = 0; factoryIndex < this.parent.activeGenerator.macroFactories.length; factoryIndex++) {
            const data = this.parent.activeGenerator.macroFactories[factoryIndex]

            const root = (
                <div>
                    <input style={{ verticalAlign: "middle", marginRight: "4px" }} type="checkbox" value={factoryIndex} checked/>
                    <span style={{ verticalAlign: "middle" }}>{data.name}</span>
                    { data.createFolderEntries &&
                        <span style={{float: "right", paddingRight: "16px", color: "lightgray"}}>Folderable</span>
                    }
                </div>

            ) as any;

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
    };

    onChangeFolderStatus = (e: any) => {
        this.parent.folderingMethod = e.target.value;
    };

    public render(): HTMLElement {
        const data: any = this.parent.activeGenerator ? this.generateCheckboxes() : {};
        const checkboxDivs = data.elems;
        const checkboxes = data.checkboxes;

        const folderingOptions = [];
        {
            for(const key in FolderingMethod) {
                const val = FolderingMethod[key];
                folderingOptions.push(<option value={val}>{val}</option>)
            }
        }

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

                            <select value={this.parent.folderingMethod} onChange={this.onChangeFolderStatus}>
                                {folderingOptions}
                            </select>

                            <CheckboxWithText
                                ignoreToggleAll
                                checked={this.parent.setIsTokenAction}
                                onChange={this.onTokenActionChecked}
                                checkboxText="Show as Token Action"
                            />

                            <CheckboxWithText
                                ignoreToggleAll
                                checked={this.parent.sortLex}
                                onChange={(e) => this.parent.sortLex = e.target.checked}
                                checkboxText="Sort lexicographically"
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
