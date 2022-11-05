import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";
import { saveAs } from 'save-as'
import { DOM, SidebarSeparator, SidebarCategoryTitle } from "../../utils/DOM";
import { TableExportLang } from "../../utils/TableExportLang";
import { readFile, safeParseJson, findByIdAndRemove } from "../../utils/MiscUtils";
import { import_multiple_files } from "../../utils/import_multiple_files";
import { LoadingDialog } from "../../utils/DialogComponents";
import Vars from './Vars';
import PasteTableExportDialog from "./PasteTableExportDialog";

const importJson = (json: any) => {
  // NOTE(justasd): yeah make sure to version your data. rip.
  // 2021-03-12
  if(!json) return;

  let table = R20.createRollableTable();

  for (let id in json.items) {
    let item = json.items[id];
    delete item.id;

    table.tableitems.create(item);
  }

  delete json.id;
  delete json.items;
  table.save(json);
};

class TableIOModule extends R20Module.OnAppLoadBase {

  static readonly journalDivId = "r20es-tableio-journal-widget";
  static readonly tableWidgetClass = "r20es-export-table-button"
  static readonly normalImportButtonId = "r20es-norma;-import-button";
  static readonly tableExportImportButtonId = "r20es-table-export-import-button";
  static readonly tableExportImportFromTextButtonId = "r20es-table-export-import-from-text-buttom";
  observer: MutationObserver;
  pasteDialog: PasteTableExportDialog;

  constructor() {
    super(__dirname);
  }

  getTableId(target) {
    // target must be the header with all the fancy classes that we match
    const query = $(target.parentNode).find(`div[${Vars.TableIdAttribute}]`);
    if (query.length <= 0) return null;

    const elem = query[0];
    if (!elem.hasAttribute(Vars.TableIdAttribute)) return null;

    return elem.getAttribute(Vars.TableIdAttribute);
  }

  onExportButtonClicked = (e: any) => {
    let tableId = this.getTableId(e.target.parentNode);
    if (!tableId) { alert("Failed to get table id."); return; }

    let table = R20.getRollableTable(tableId);
    if (!table) { alert(`Failed to get table. Table id: ${tableId}`); return; }

    let data = JSON.stringify(table.attributes, null, 4);

    let jsonBlob = new Blob([data], { type: 'data:application/json;charset=utf-8' });
    saveAs(jsonBlob, table.get("name") + ".json");
  }

  tryInsertTableWidget(target: HTMLElement) {
    if (!target.className) return false;
    if (target.className !== "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix ui-draggable-handle") return false;
    if (target.getElementsByClassName(TableIOModule.tableWidgetClass).length > 0) return false;

    const table = this.getTableId(target);

    if (!table) return false;

    const button = (
      <button
        style={{ marginTop: "8px" }}
        onClick={this.onExportButtonClicked}
        className={[TableIOModule.tableWidgetClass, "btn"]}
      >
        Export
      </button>
    );

    target.appendChild(button);
    return true;
  }

  importTableJson(e: any) {
    const json = safeParseJson(e);
    if (!json) return;

    importJson(json);
  }

  importTablesTableExport(e: string)  {
    if (!TableExportLang.naiveVerify(e)) return;

    const tables = TableExportLang.parse(e) as any;

    if (!tables) return;

    if (!tables || tables.length <= 0) return;

    for (let tableName in tables) {
      importJson(tables[tableName]);
    }
  }

  onImportClicked = (e: any) => {
    e.stopPropagation();

    const file_selector_element = (
      <input 
        type="file"
        multiple={true}
      />
    );

    let import_proc = null;
    if(e.target.id === TableIOModule.tableExportImportButtonId) {
      import_proc = this.importTablesTableExport;
    }
    else {
      file_selector_element.accept = ".json";
      import_proc = this.importTableJson;
    }

    import_multiple_files(file_selector_element, async (handle: File) => {
      const read = await readFile(handle) as string;
      import_proc(read);
    });
  };

  setButtonDisabled(root, state) {
    let query = $(root).find(".btn");
    query.each(idx => {
      query[idx].disabled = state;
    });
  }

  onImportFromPasteClicked = (e: any) => {
    e.stopPropagation();
    this.pasteDialog.show();
  };

  onPasteDialogClose = (e: any) => {
    if(!this.pasteDialog.isSuccessful()) return;

    try {
      this.importTablesTableExport(this.pasteDialog.getData());
    }
    catch(e) {
      alert(e);
      console.error(e);
    }
  };

  setup() {
    if (!R20.isGM()) return;

    this.pasteDialog = new PasteTableExportDialog();
    this.pasteDialog.getRoot().addEventListener("close", this.onPasteDialogClose);

    // @COPYPASTE from CharacterIOModule
    const existingHeaders = document.querySelectorAll(
      ".ui-dialog-titlebar, .ui-widget-header, .ui-corner-all,  .ui-helper-clearfix"
    ) as any;

    for (const header of existingHeaders) {
      this.tryInsertTableWidget(header);
    }

    let root = document.getElementById("deckstables").getElementsByClassName("content")[0];

    const elem = (
      <div id={TableIOModule.journalDivId} style={{marginBottom: "20px"}}>
        <SidebarSeparator />

        <SidebarCategoryTitle>
          Import Rollable Tables
        </SidebarCategoryTitle>

        <div style={{ display: "grid", gridTemplateRows:"1fr 1fr 1fr", gridRowGap: "8px"}}>
          <button 
            id={TableIOModule.normalImportButtonId} 
            onClick={this.onImportClicked} 
            className="btn" 
          >
            Import From JSON
          </button>

          <button 
            id={TableIOModule.tableExportImportButtonId} 
            onClick={this.onImportClicked} 
            className="btn" 
          >
            Import From TableExport
          </button>

          <button 
            id={TableIOModule.tableExportImportFromTextButtonId} 
            onClick={this.onImportFromPasteClicked} 
            className="btn" 
          >
            Paste TableExport Text
          </button>
        </div>
      </div>
    );

    root.appendChild(elem);

    this.observer = new MutationObserver((muts: any[]) => {
      for (var e of muts) {
        if (this.tryInsertTableWidget(e.target)) {
          break;
        }
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  dispose() {
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

export default () => {
  new TableIOModule().install();
};

