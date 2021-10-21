import { DOM } from "../../utils/DOM";
import { DialogBase } from "../../utils/DialogBase";
import { Dialog, DialogHeader, DialogBody} from "../../utils/DialogComponents";
import ChangelogWidget from "../ChangelogWidget";

export default class ChangelogDialog extends DialogBase<null> {

  constructor() {
    super(null, {
      maxWidth: "40%",
      maxHeight: "85%"
    });
  }

  public show() {
    setTimeout(() => {
      this.recenter();
      this.getRoot().scrollTop = 0;
    }, 100);

    this.internalShow();
  };
  protected render(): HTMLElement {
    return (
      <Dialog>
        <DialogHeader style={{ textAlign: "center" }}>
          <h1>VTTES - Changelog</h1>
        </DialogHeader>

        <DialogBody>
          <ChangelogWidget listAllVersions={true}/>
        </DialogBody>

        <section style={{
          position: "sticky",
          padding: "20px",
          bottom: 0,
          top: 0,
          left: 0,
          backgroundColor: "rgb(253, 253, 253)",
        }}>
          <input
            className="btn"
            style={{
              width: "100%", 
              height: "auto", 
              boxSizing: "border-box",
            }}
            type="button"
            onClick={this.close}
            value="OK" 
          />
        </section>
      </Dialog> as any
    );
  }
}
