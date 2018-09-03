import { R20Module } from "../../tools/R20Module"
import { DOM, SidebarSeparator, SidebarCategoryTitle } from '../../tools/DOM'
import { findByIdAndRemove, readFile } from "../../tools/MiscUtils";
import { R20 } from "../../tools/R20";
import { MacroIO, IApplyableMacroData } from "../../tools/MacroIO";
import { saveAs } from 'save-as'
import PickMacros from "./PickMacros";

type FilterTableType = { [id: number]: boolean };

class MacroIOModule extends R20Module.OnAppLoadBase {
    readonly widgetId = "r20es-macro-io-widget";

    private pickMacrosDialog: PickMacros;
    private continueCallback: (finalMacros: IApplyableMacroData[]) => void;
    private macroBuffer: IApplyableMacroData[];

    constructor() {
        super(__dirname);
    }

    private onFileChange(e: any) {
        e.stopPropagation();
        const targ = e.target;
        
        ($(targ.parentNode).find("button.import")[0] as any).disabled = targ.files.length <= 0;
    }

    private onImportClick = (e: any) => {
        e.stopPropagation();
        
        const fs = $((e.target).parentNode.parentNode).find("input[type='file']")[0];

        const file = fs.files[0];
        fs.value = "";
        (e.target as any).disabled = true

        readFile(file)
            .then((payload: string) => {
                const result = MacroIO.deserialize(payload);
                if(result.isErr()) throw new Error(result.err().unwrap());
                
                this.macroBuffer = result.ok().unwrap();
                this.continueCallback = this.continueImporting;
                this.pickMacrosDialog.show(this.macroBuffer);
            })
            .catch(alert);
    }

    private continueImporting(finalMacros: IApplyableMacroData[]) {
        MacroIO.applyToPlayer(R20.getCurrentPlayer(), finalMacros);

        R20.rerenderJournalMacros();
        R20.rerenderMacroBar();
    }

    private onExportClick = (e: any) => {
        e.stopPropagation();

        const player = R20.getCurrentPlayer();
        const macros = MacroIO.prepareMacroList(player);

        if(macros.length <= 0) {
            alert("No macros found.")
            return;
        }

        this.macroBuffer = macros;
        this.continueCallback = this.continueExporting;
        this.pickMacrosDialog.show(this.macroBuffer);
    }

    private continueExporting(finalMacros: IApplyableMacroData[]) {
        const result = MacroIO.serialize(finalMacros);

        const jsonBlob = new Blob([result], { type: 'data:application/json;charset=utf-8' });
        saveAs(jsonBlob, R20.getCurrentPlayer().attributes.displayname+ "_macros.json");
    }

    private onPickMacrosClose = (e: any) => {
        if(!this.pickMacrosDialog.isSuccessful()) return;
        const isNotFilteredAt = this.pickMacrosDialog.getData();

        const finalMacros = [];
        this.macroBuffer.forEach((val, idx) => {
            if(isNotFilteredAt[idx]) return;
            finalMacros.push(val);
        });

        if(finalMacros.length <= 0) {
            alert("Selection is empty.");
            return;
        }

        this.continueCallback(finalMacros);
    }

    public setup() {
        this.pickMacrosDialog = new PickMacros();
        this.pickMacrosDialog.getRoot().addEventListener("close", this.onPickMacrosClose);
        
        const root = $("#deckstables")[0].firstElementChild;
        const nextTo = $("#deckstables").find("#adddeck")[0]
        const widget = (
            <div id={this.widgetId}>
                <div>
                    <SidebarCategoryTitle>
                        Import/Export Macros
                </SidebarCategoryTitle>

                    <input
                        type="file"
                        style={{ width: "95%" }}
                        onChange={this.onFileChange}
                    />

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button disabled className="import btn" style={{ marginRight: "8px", width: "100%" }} onClick={this.onImportClick}>
                            Import
                    </button>

                        <button className="btn" style={{ width: "100%" }} onClick={this.onExportClick}>
                            Export
                    </button>
                    </div>

                </div>

                <SidebarSeparator big="1px" />
            </div>
        );

        root.insertBefore(widget, nextTo);
    }

    public dispose() {
        if(this.pickMacrosDialog) this.pickMacrosDialog.dispose();

        findByIdAndRemove(this.widgetId);
        super.dispose();
    }
}

if (R20Module.canInstall()) new MacroIOModule().install();

