import { R20Module } from "../../tools/R20Module";
import { R20 } from "../../tools/R20";
import { TableIO } from "../../tools/TableIO";
import { saveAs } from 'save-as'
import { DOM, SidebarSeparator, SidebarCategoryTitle } from "../../tools/DOM";
import { TableExportLang } from "../../tools/TableExportLang";
import { readFile, safeParseJson, findByIdAndRemove } from "../../tools/MiscUtils";
import { LoadingDialog } from "../../tools/DialogComponents";
import Vars from './Vars';

class TableIOModule extends R20Module.OnAppLoadBase {

    private static readonly tableWidgetClass = "r20es-export-table-button"
    private static readonly journalDivId = "r20es-tableio-journal-widget";
    private static readonly normalImportButtonId = "r20es-norma;-import-button";
    private static readonly tableExportImportButtonId = "r20es-table-export-import-button";
    private observer: MutationObserver;

    public constructor() {
        super(__dirname);
    }

    private getTableId(target: any) {
        // target must be the header with all the fancy classes that we match

        const query = $(target.parentNode).find(`div[${Vars.TableIdAttribute}]`);
        if (query.length <= 0) return null;

        const elem = query[0];
        if (!elem.hasAttribute(Vars.TableIdAttribute)) return null;

        return elem.getAttribute(Vars.TableIdAttribute);
    }

    private onExportButtonClicked = (e) => {
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
            if (this.tryInsertTableWidget(e.target as HTMLElement)) {
                break;
            }
        }
    }

    private static importTableJson(e) {
        const json = safeParseJson(e);
        if (!json) return;

        TableIO.importJson(json);
    }

    private static importTablesTableExport(e) {
        if (!TableExportLang.naiveVerify(e)) return;

        let tables = null;
        try {
            tables = TableExportLang.parse(e);
        } catch (err) {
            alert(err);
        }
        if (!tables) return;

        if (!tables || tables.length <= 0) return;

        for (let tableName in tables) {
            TableIO.importJson(tables[tableName]);
        }
    }

    private onImportClicked = (e) => {

        let cb = e.target.id === TableIOModule.tableExportImportButtonId
            ? TableIOModule.importTablesTableExport
            : TableIOModule.importTableJson;

        const input = $(e.target.parentNode.parentNode).find("input")[0];

        const plsWait = new LoadingDialog("Importing");
        plsWait.show()

        const handle = input.files[0];

        (readFile(handle)
            .then(cb)
            .catch(alert) as any)
            .finally(plsWait.dispose);

        input.value = "";
        TableIOModule.setButtonDisabled(e.target.parentNode, true);
    }

    private static setButtonDisabled(root: HTMLElement, state: boolean) {
        let query = $(root).find(".btn") as JQuery<HTMLButtonElement>;
        query.each(idx => {
            query[idx].disabled = state;
        });
    }

    private onFileChanged = (e) => {
        TableIOModule.setButtonDisabled(e.target.parentNode, e.target.files.length <= 0);
    }

    public setup() {
        if (!R20.isGM()) return;

        // @COPYPASTE from CharacterIOModule
        const existingHeaders: any = document.querySelectorAll(".ui-dialog-titlebar, .ui-widget-header, .ui-corner-all,  .ui-helper-clearfix");

        for (const header of existingHeaders) {
            this.tryInsertTableWidget(header);
        }

        let root = document.getElementById("deckstables").getElementsByClassName("content")[0];

        const buttonStyle = { width: "100%", marginBottom: "20px", marginRight: "8px" };
        const elem = <div id={TableIOModule.journalDivId}>
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
        </div >

        root.appendChild(elem);

        this.observer = new MutationObserver(this.observerCallback);
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    public dispose() {
        super.dispose();
        if (this.observer) {
            this.observer.disconnect();
        }

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
