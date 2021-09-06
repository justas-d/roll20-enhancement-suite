import {DialogBase} from "../../utils/DialogBase";
import {Dialog, DialogBody, DialogFooter, DialogFooterContent, DialogHeader} from "../../utils/DialogComponents";
import {DOM} from "../../utils/DOM";
import { TableExportLang } from "../../utils/TableExportLang";

export default class PasteTableExportDialog extends DialogBase<string> {

  private static readonly textAreaId = "r20es-paste-table-export-dialog-text-area";

  private onImportClick = (e: Event) => {
    e.stopPropagation();

    const txtBox = document.getElementById(PasteTableExportDialog.textAreaId) as HTMLTextAreaElement;

    console.log(txtBox);
    if(!TableExportLang.naiveVerify(txtBox.value)) {
      return;
    }

    this.setData(txtBox.value);
    this.close(true);
  };

  public show = this.internalShow;

  protected render(): HTMLElement {
    return (
      <Dialog>
        <DialogHeader>
          <h2>Paste TableExport</h2>
        </DialogHeader>

        <DialogBody>
          <div>
            <textarea style={{width: "512px", height: "256px"}}id={PasteTableExportDialog.textAreaId} autocomplete={false} autofocus={true}/>
          </div>

          <div>
            <a href="javascript:void(0)" onClick={() => window.open("https://docs.google.com/document/d/1Y5fMpkcm615KH_9ih-HCagswAdgS1CkBiktKeJABiBY", "_blank")}>Document filled with tables</a>
          </div>

        </DialogBody>

        <DialogFooter>
          <DialogFooterContent>
            <button className="btn" onClick={this.close}>Close</button>
            <button className="btn" style={{float: "right"}}onClick={this.onImportClick}>Import</button>
          </DialogFooterContent>
        </DialogFooter>
      </Dialog>
    )
  }
}
