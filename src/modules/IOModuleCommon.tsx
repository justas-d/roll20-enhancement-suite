import { DOM, SidebarSeparator, SidebarCategoryTitle } from '../utils/DOM'
import { R20Module } from "../utils/R20Module"
import { saveAs } from 'save-as'
import PickObjectsDialog from "./PickObjectsDialog";
import {findByIdAndRemove, readFile} from "../utils/MiscUtils";
import {IResult} from "../utils/Result";

export abstract class IOModuleCommon<T> extends R20Module.OnAppLoadBase {

    private pickMacrosDialog: PickObjectsDialog<T>;
    private buffer: T[];
    private pickDialogTitle: string;
    private widgetId: string;
    private widgetTitle: string;
    private dialogClass: string | null;

    constructor(id: string,
                widgetId: string,
                widgetTitle: string,
                pickDialogTitle: string,
                dialogClass: string | null) {
        super(id);
        this.widgetId = widgetId;
        this.dialogClass = dialogClass;
        this.widgetTitle = widgetTitle;
        this.pickDialogTitle = pickDialogTitle;
    }

    protected abstract nameGetter(d: T): string;
    protected abstract descGetter(d: T): string;
    protected abstract tryDeserialize(data: string): IResult<T[], string>;
    protected abstract continueImporting(finalData: T[]);
    protected abstract getExportData(): T[];
    protected abstract serializeExportData(finalData: T[]): {json: string, filename: string};
    protected abstract injectWidget(widget: HTMLElement);

    private continueExporting = (finalData: T[]) => {
        const data = this.serializeExportData(finalData);

        const jsonBlob = new Blob([data.json], {type: 'data:application/json;charset=utf-8'});
        saveAs(jsonBlob, data.filename);
    };

    private onFileChange = (e: any) => {
        e.stopPropagation();
        const targ = e.target;

        ($(targ.parentNode).find("button.import")[0] as any).disabled = targ.files.length <= 0;
    };

    private showPickDialog(continueCallback: (data: T[]) => void) {
        this.pickMacrosDialog.show(this.pickDialogTitle,
            this.buffer,
            this.nameGetter,
            this.descGetter,
            continueCallback);
    }

    private onImportClick = (e: any) => {
        e.stopPropagation();

        const fs = $((e.target).parentNode.parentNode).find("input[type='file']")[0];

        const file = fs.files[0];
        fs.value = "";
        (e.target as any).disabled = true;

        readFile(file)
            .then((payload: string) => {
                const result = this.tryDeserialize(payload);
                if (result.isErr()) throw new Error(result.err().unwrap());

                this.buffer= result.ok().unwrap();
                this.showPickDialog(this.continueImporting);
            })
            .catch(alert);
    };

    private onExportClick = (e: any) => {
        e.stopPropagation();

        const data =this.getExportData();

        if (data.length <= 0) {
            alert("No data to be exported.");
            return;
        }

        this.buffer = data;
        this.showPickDialog(this.continueExporting);
    };

    public setup() {
        this.pickMacrosDialog = new PickObjectsDialog<T>(this.dialogClass);

        const widget = (
            <div id={this.widgetId}>
                <div>
                    <SidebarCategoryTitle>
                        {this.widgetTitle}
                    </SidebarCategoryTitle>

                    <input
                        type="file"
                        style={{width: "95%"}}
                        onChange={this.onFileChange}
                    />

                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <button disabled className="import btn" style={{marginRight: "8px", width: "100%"}}
                                onClick={this.onImportClick}>
                            Import
                        </button>

                        <button className="btn" style={{width: "100%"}} onClick={this.onExportClick}>
                            Export
                        </button>
                    </div>

                </div>

                <SidebarSeparator big="1px"/>
            </div>
        );

        this.injectWidget(widget);
    }

    public dispose() {
        if (this.pickMacrosDialog) this.pickMacrosDialog.dispose();

        findByIdAndRemove(this.widgetId);
        super.dispose();
    }
}
