import { R20Module } from "../tools/r20Module";
import { R20 } from "../tools/r20api";
import { TableIO } from "../tools/table-io";
import { saveAs } from 'save-as'
import { createSidebarSeparator, createElement, createElementJsx } from "../tools/createElement";
import { readFile, safeParseJson } from "../tools/fileUtil";
import { TableExportLang } from "../tools/table-export-lang";
import { findByIdAndRemove } from "../tools/miscUtil";

const tableIdAttribute = "data-r20es-table-id";

class TableIOModule extends R20Module.OnAppLoadBase {
    constructor(id) {
        super(id);

        this.journalDivId = "r20es-tableio-journal-widget";
        this.buttonClass = "r20es-export-table-button"
        this.observerCallback = this.observerCallback.bind(this);
        this.onExportButtonClicked = this.onExportButtonClicked.bind(this);
    }

    getTableId(target) {
        const query = $(target.parentNode.parentNode).find(`div[${tableIdAttribute}]`);
        if(query.length <= 0) return null;

        const elem = query[0];
        if(!elem.hasAttribute(tableIdAttribute)) return null;
        return elem.getAttribute(tableIdAttribute)
    }

    onExportButtonClicked(e) {
        let tableId = this.getTableId(e.target);
        if (!tableId) { alert("Failed to get table id."); return;}

        let table = R20.getRollableTable(tableId);
        if (!table) { alert(`Failed to get table. Table id: ${tableId}`); return; }
        
        let data = TableIO.exportJson(table);

        let jsonBlob = new Blob([data], { type: 'data:application/javascript;charset=utf-8' });
        saveAs(jsonBlob, table.get("name") + ".json");
    }

    observerCallback(muts) {
        for (var e of muts) {
            if (e.target.className && e.target.className === "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix") {

                if (e.target.getElementsByClassName(this.buttonClass).length > 0) return;
                if(!this.getTableId(e.target)) return;

                const button = <button
                    style={{ marginTop: "8px" }}
                    onClick={this.onExportButtonClicked}
                    className={[this.buttonClass, "btn"]}>
                    Export
                </button>;

                e.target.appendChild(button);

                return;
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

        const tables = TableExportLang.parse(e);
        if (!tables || tables.length <= 0) return;

        for (let tableName in tables) {
            TableIO.importJson(tables[tableName]);
        }
    }

    setup() {
        if (!R20.isGM()) return;

        this.observer = new MutationObserver(this.observerCallback);
        this.observer.observe(document.body, { childList: true, subtree: true });

        let rootOfDiv = document.getElementById("deckstables").getElementsByClassName("content")[0];

        function setButtonDisabled(root, state) {
            let query = $(root).find(".btn");
            query.each(idx => {
                query[idx].disabled = state;
            });
        }

        function mkCallback(cb) {
            return e => {
                const input = $(e.target.parentNode).find("input")[0];

                readFile(input.files[0], (e2) => {
                    cb(e2.target.result);
                });

                input.value = "";
                setButtonDisabled(e.target.parentNode, true);
            }
        };

        createElement("div", { id: this.journalDivId }, [
            () => { return createSidebarSeparator(); },

            createElement("h3", {
                innerHTML: "Import Rollable Table",
                style: {
                    marginBottom: "5px",
                    marginLeft: "5px"
                }
            }),
            createElement("input", {
                type: "file",
                onChange: (e) => { setButtonDisabled(e.target.parentNode, e.target.files.length <= 0); }
            }),
            createElement("button", {
                innerHTML: "Import",
                disabled: true,
                className: "btn",
                style: {
                    float: "left"
                },
                onClick: mkCallback((e) => { this.importTableJson(e) })
            }),
            createElement("button", {
                innerHTML: "Import (TableExport)",
                disabled: true,
                className: "btn",
                style: {
                    float: "left",
                },
                onClick: mkCallback((e) => this.importTablesTableExport(e))
            })

        ], rootOfDiv);
    }

    dispose() {
        if (this.observer) {
            this.observer.disconnect();
        }

        findByIdAndRemove(this.journalDivId);
    }
}

if (R20Module.canInstall()) new TableIOModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "importExportTable",
    name: "Table Import/export",
    description: "Provides rollable table importing and exporting. Supports TableExport format tables.",
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