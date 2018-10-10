import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";
import { TableIO } from "../../utils/TableIO";
import { saveAs } from 'save-as'
import { DOM, SidebarSeparator, SidebarCategoryTitle } from "../../utils/DOM";
import { TableExportLang } from "../../utils/TableExportLang";
import { readFile, safeParseJson, findByIdAndRemove } from "../../utils/MiscUtils";
import { LoadingDialog } from "../../utils/DialogComponents";
import Vars from './Vars';
import PasteTableExportDialog from "./PasteTableExportDialog";

class TableIOModule extends R20Module.OnAppLoadBase {

    private static readonly journalDivId = "r20es-tableio-journal-widget";
    private static readonly tableWidgetClass = "r20es-export-table-button"
    private static readonly normalImportButtonId = "r20es-norma;-import-button";
    private static readonly tableExportImportButtonId = "r20es-table-export-import-button";
    private static readonly tableExportImportFromTextButtonId = "r20es-table-export-import-from-text-buttom";
    private observer: MutationObserver;
    private pasteDialog: PasteTableExportDialog;

    public constructor() {
        super(__dirname);
    }

    private getTableId(target) {
        // target must be the header with all the fancy classes that we match
        const query = $(target.parentNode).find(`div[${Vars.TableIdAttribute}]`);
        if (query.length <= 0) return null;

        const elem = query[0];
        if (!elem.hasAttribute(Vars.TableIdAttribute)) return null;

        return elem.getAttribute(Vars.TableIdAttribute);
    }

    private onExportButtonClicked = (e: any) => {
        let tableId = this.getTableId(e.target.parentNode);
        if (!tableId) { alert("Failed to get table id."); return; }

        let table = R20.getRollableTable(tableId);
        if (!table) { alert(`Failed to get table. Table id: ${tableId}`); return; }

        let data = TableIO.exportJson(table);

        let jsonBlob = new Blob([data], { type: 'data:application/json;charset=utf-8' });
        saveAs(jsonBlob, table.get("name") + ".json");
    }

    private tryInsertTableWidget(target: HTMLElement) {
        if (!target.className) return false;
        if (target.className !== "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix") return false;
        if (target.getElementsByClassName(TableIOModule.tableWidgetClass).length > 0) return false;

        const table = this.getTableId(target);

        if (!table) return false;

        const button = <button
            style={{ marginTop: "8px" }}
            onClick={this.onExportButtonClicked}
            className={[TableIOModule.tableWidgetClass, "btn"]}>
            Export
            </button>;

        target.appendChild(button);
        return true;
    }

    private observerCallback = (muts: any[]) => {
        for (var e of muts) {
            if (this.tryInsertTableWidget(e.target)) {
                break;
            }
        }
    }

    private importTableJson(e: any) {
        const json = safeParseJson(e);
        if (!json) return;

        TableIO.importJson(json);
    }

    private importTablesTableExport(e: string)  {
        if (!TableExportLang.naiveVerify(e)) return;
        console.log(e);

        let tables = null;
        try {
            tables = TableExportLang.parse(e);
        } catch (err) {
            console.error(err);
            alert(err);
        }
        if (!tables) return;

        if (!tables || tables.length <= 0) return;

        for (let tableName in tables) {
            TableIO.importJson(tables[tableName]);
        }
    }

    private onImportClicked = (e: any ) => {

        let cb = e.target.id === TableIOModule.tableExportImportButtonId
            ? this.importTablesTableExport
            : this.importTableJson;

        const input = $(e.target.parentNode.parentNode).find("input")[0];

        const plsWait = new LoadingDialog("Importing");
        plsWait.show()

        const handle = input.files[0];

        (readFile(handle)
            .then(cb)
            .catch(alert) as any)
            .finally(plsWait.dispose);

        input.value = "";
        this.setButtonDisabled(e.target.parentNode, true);
    };

    private setButtonDisabled(root, state) {
        let query = $(root).find(".btn");
        query.each(idx => {
            query[idx].disabled = state;
        });
    }

    private onFileChanged = (e) => {
        this.setButtonDisabled(e.target.parentNode, e.target.files.length <= 0);
    };

    private onImportFromPasteClicked = (e: any) => {
        e.stopPropagation();
        this.pasteDialog.show();
    };

    private onPasteDialogClose = (e: any) => {
        if(!this.pasteDialog.isSuccessful()) return;

        this.importTablesTableExport(this.pasteDialog.getData());
    };

    public setup() {
        if (!R20.isGM()) return;

        this.pasteDialog = new PasteTableExportDialog();
        this.pasteDialog.getRoot().addEventListener("close", this.onPasteDialogClose);

        // @COPYPASTE from CharacterIOModule
        const existingHeaders = document.querySelectorAll(".ui-dialog-titlebar, .ui-widget-header, .ui-corner-all,  .ui-helper-clearfix") as any;

        for (const header of existingHeaders) {
            this.tryInsertTableWidget(header);
        }

        let root = document.getElementById("deckstables").getElementsByClassName("content")[0];

        const buttonStyle = { width: "100%", marginRight: "8px", marginBottom: "8px" };
        const elem = <div id={TableIOModule.journalDivId} style={{marginBottom: "20px"}}>
            <SidebarSeparator />

            <SidebarCategoryTitle>
                Import Rollable Table
            </SidebarCategoryTitle>


            <input 
                onChange={this.onFileChanged} 
                type="file" 
                style={{width: "95%"}}
            />

            <div style={{ display: "flex", justifyContent: "space-between"}}>
                <button id={TableIOModule.normalImportButtonId} onClick={this.onImportClicked} disabled className="btn" style={buttonStyle}>
                    Import
                </button>

                <button id={TableIOModule.tableExportImportButtonId} onClick={this.onImportClicked} disabled className="btn" style={buttonStyle}>
                    Import (TableExport)
                </button>
            </div>

            <button id={TableIOModule.tableExportImportFromTextButtonId} onClick={this.onImportFromPasteClicked} className="btn" style={{width: "90%", float: "unset"}}>
                Import TableExport (Paste text)
            </button>

        </div >;

        root.appendChild(elem);

        this.observer = new MutationObserver(this.observerCallback);
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    public dispose() {
        super.dispose();
        if (this.observer) this.observer.disconnect();
        if(this.pasteDialog) this.pasteDialog.dispose();

        // @COPYPASTE from CharacterIOModule
        const widgets = document.getElementsByClassName(TableIOModule.tableWidgetClass);


        // removing a widget modifies the widgets html element collection 
        // therefore we have to treat this as a stack
        let num = widgets.length;
        while (num-- > 0) {
            widgets[0].remove();
        }

        findByIdAndRemove(TableIOModule.journalDivId);
    }
}

if (R20Module.canInstall()) new TableIOModule().install();
