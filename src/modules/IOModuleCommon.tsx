import {DOM, SidebarCategoryTitle, SidebarSeparator} from '../utils/DOM'
import {R20Module} from "../utils/R20Module"
import {saveAs} from 'save-as'
import PickObjectsDialog from "./PickObjectsDialog";
import {findByIdAndRemove, readFile} from "../utils/MiscUtils";
import { Optional } from "../utils/TypescriptUtils";
import {IResult} from "../utils/Result";

export abstract class IOModuleCommon<T> extends R20Module.OnAppLoadBase {

  pickMacrosDialog: PickObjectsDialog<T>;
  buffer: T[];
  pickDialogTitle: string;
  object_name: string;
  widgetId: string;
  widgetTitle: string;
  dialogClass: string | null;

  constructor(
    id: string,
    widgetId: string,
    widgetTitle: string,
    pickDialogTitle: string,
    object_name: string,
    dialogClass: string | null
  ) {
    super(id);
    this.object_name = object_name;
    this.widgetId = widgetId;
    this.dialogClass = dialogClass;
    this.widgetTitle = widgetTitle;
    this.pickDialogTitle = pickDialogTitle;
  }

  abstract nameGetter(d: T): string;
  abstract descGetter(d: T): string;
  abstract tryDeserialize(data: string): IResult<T[], string>;
  abstract continueImporting(finalData: T[]);
  abstract getExportData(): T[];
  abstract serializeExportData(finalData: T[]): {json: string, filename: string};
  abstract injectWidget(widget: HTMLElement);

  abstract extra_drawing_above_table_import(): Optional<HTMLElement>;

  continueExporting = (finalData: T[]) => {
    const data = this.serializeExportData(finalData);

    const jsonBlob = new Blob([data.json], {type: 'data:application/json;charset=utf-8'});
    saveAs(jsonBlob, data.filename);
  };

  showPickDialog(
    continueCallback: (data: T[]) => void,
    extra_drawing_above_table_import: Optional<() => Optional<HTMLElement>>
  ) {
    this.pickMacrosDialog.show(
      this.pickDialogTitle,
      this.object_name,
      this.buffer,
      this.nameGetter,
      this.descGetter,
      continueCallback,
      extra_drawing_above_table_import
    );
  }

  onImportClick = (e: any) => {
    e.stopPropagation();

    const file_selector_element = (
      <input 
        type="file"
        accept=".json"
      />
    );

    const listener = () => {
      file_selector_element.removeEventListener("change", listener);
      const f_handle = file_selector_element.files[0];

      readFile(f_handle)
        .then((payload: string) => {
          const result = this.tryDeserialize(payload);
          if (result.isErr()) throw new Error(result.err().unwrap());

          this.buffer= result.ok().unwrap();
          this.showPickDialog(this.continueImporting, () => this.extra_drawing_above_table_import());
        })
        .catch(alert);
    };

    file_selector_element.click();
    file_selector_element.addEventListener("change", listener);
  };

  onExportClick = (e: any) => {
    e.stopPropagation();

    const data =this.getExportData();

    if(data.length <= 0) {
      alert("No data to be exported.");
      return;
    }

    this.buffer = data;
    this.showPickDialog(this.continueExporting, undefined);
  };

  setup() {
    this.pickMacrosDialog = new PickObjectsDialog<T>(this.dialogClass);

    const widget = (
      <div id={this.widgetId}>
        <div>
          <SidebarCategoryTitle>
            {this.widgetTitle}
          </SidebarCategoryTitle>

          <div style={{display: "flex", justifyContent: "space-between"}}>
            <button 
              className="import btn" 
              style={{marginRight: "8px", width: "100%"}}
              onClick={this.onImportClick}
            >
              Import
            </button>

            <button 
              className="btn" 
              style={{width: "100%"}} 
              onClick={this.onExportClick}
            >
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
