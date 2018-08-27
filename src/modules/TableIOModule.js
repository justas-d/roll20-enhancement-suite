import { R20Module } from "../tools/R20Module";
import { R20 } from "../tools/R20";
import { TableIO } from "../tools/TableIO";
import { saveAs } from 'save-as'
import { DOM, SidebarSeparator, SidebarCategoryTitle } from "../tools/DOM";
import { TableExportLang } from "../tools/TableExportLang";
import { readFile, safeParseJson, findByIdAndRemove } from "../tools/MiscUtils";
import { LoadingDialog } from "../tools/DialogComponents";

const tableIdAttribute = "data-r20es-table-id";

class TableIOModule extends R20Module.OnAppLoadBase {
    constructor(id) {
        super(id);

        this.journalDivId = "r20es-tableio-journal-widget";
        this.tableWidgetClass = "r20es-export-table-button"

        this.normalImportButtonId = "r20es-norma;-import-button";
        this.tableExportImportButtonId = "r20es-table-export-import-button";

        this.observerCallback = this.observerCallback.bind(this);
        this.onExportButtonClicked = this.onExportButtonClicked.bind(this);
        this.onImportClicked = this.onImportClicked.bind(this);
        this.onFileChanged = this.onFileChanged.bind(this);
    }

    getTableId(target) {
        // target must be the header with all the fancy classes that we match
        const query = $(target.parentNode).find(`div[${tableIdAttribute}]`);
        if (query.length <= 0) return null;

        const elem = query[0];
        if (!elem.hasAttribute(tableIdAttribute)) return null;

        return elem.getAttribute(tableIdAttribute);
    }

    onExportButtonClicked(e) {
        let tableId = this.getTableId(e.target.parentNode);
        if (!tableId) { alert("Failed to get table id."); return; }

        let table = R20.getRollableTable(tableId);
        if (!table) { alert(`Failed to get table. Table id: ${tableId}`); return; }

        let data = TableIO.exportJson(table);

        let jsonBlob = new Blob([data], { type: 'data:application/json;charset=utf-8' });
        saveAs(jsonBlob, table.get("name") + ".json");
    }

    tryInsertTableWidget(target) {
        if (!target.className) return false;
        if (target.className !== "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix") return false;
        if (target.getElementsByClassName(this.tableWidgetClass).length > 0) return false;

        const table = this.getTableId(target);

        if (!table) return false;

        const button = <button
            style={{ marginTop: "8px" }}
            onClick={this.onExportButtonClicked}
            className={[this.tableWidgetClass, "btn"]}>
            Export
            </button>;

        target.appendChild(button);
        return true;
    }

    observerCallback(muts) {
        for (var e of muts) {
            if (this.tryInsertTableWidget(e.target)) {
                break;
            }
        }
    }

    importTableJson(e) {
        const json = safeParseJson(e);
        if (!json) return;

        TableIO.importJson(json);
    }

    importTablesTableExport(e) {
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

    onImportClicked(e) {

        let cb = e.target.id === this.tableExportImportButtonId
            ? this.importTablesTableExport
            : this.importTableJson;

        const input = $(e.target.parentNode).find("input")[0];

        const plsWait = new LoadingDialog("Importing");
        plsWait.show()

        const handle = input.files[0];

        readFile(handle)
            .then(cb)
            .catch(alert)
            .finally(plsWait.dispose);

        input.value = "";
        this.setButtonDisabled(e.target.parentNode, true);
    }

    setButtonDisabled(root, state) {
        let query = $(root).find(".btn");
        query.each(idx => {
            query[idx].disabled = state;
        });
    }

    onFileChanged(e) {
        this.setButtonDisabled(e.target.parentNode, e.target.files.length <= 0);
    }

    setup() {
        if (!R20.isGM()) return;

        // @COPYPASTE from CharacterIOModule
        const existingHeaders = document.querySelectorAll(".ui-dialog-titlebar, .ui-widget-header, .ui-corner-all,  .ui-helper-clearfix");

        for (const header of existingHeaders) {
            this.tryInsertTableWidget(header);
        }

        let root = document.getElementById("deckstables").getElementsByClassName("content")[0];

        const buttonStyle = { width: "100%", marginBottom: "20px", marginRight: "8px" };
        const elem = <div id={this.journalDivId}>
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
                <button id={this.normalImportButtonId} onClick={this.onImportClicked} disabled className="btn" style={buttonStyle}>
                    Import
            </button>

                <button id={this.tableExportImportButtonId} onClick={this.onImportClicked} disabled className="btn" style={buttonStyle}>
                    Import (TableExport)
            </button>
            </div>
        </div >

        root.appendChild(elem);

        this.observer = new MutationObserver(this.observerCallback);
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    dispose() {
        super.dispose();
        if (this.observer) {
            this.observer.disconnect();
        }

        // @COPYPASTE from CharacterIOModule
        const widgets = document.getElementsByClassName(this.tableWidgetClass);


        // removing a widget modifies the widgets html element collection 
        // therefore we have to treat this as a stack
        let num = widgets.length;
        while (num-- > 0) {
            widgets[0].remove();
        }

        findByIdAndRemove(this.journalDivId);
    }
}

if (R20Module.canInstall()) new TableIOModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "importExportTable",
    name: "Table Importer/Exporter",
    description: "Provides rollable table importing and exporting. Supports TableExport format tables. Controls can be found in the \"Collection\" sidebar tab.",
    category: R20Module.category.exportImport,
    gmOnly: true,

    mods: [
        { // add table id to popup
            includes: "assets/app.js",
            find: `this.$el.on("click",".deleterollabletable"`,
            patch: `this.el.setAttribute("${tableIdAttribute}", this.model.get("id")),this.$el.on("click",".deleterollabletable"`,
        }
    ]
});

export { hook as TableIOHook };
