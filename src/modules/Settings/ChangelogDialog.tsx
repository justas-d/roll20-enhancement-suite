import { DOM } from "../../tools/DOM";
import { DialogBase } from "../../tools/DialogBase";
import { Dialog, DialogHeader, DialogBody} from "../../tools/DialogComponents";
import ChangelogWidget from "../ChangelogWidget";

export default class ChangelogDialog extends DialogBase<null> {
    public show() {
        setTimeout(() => {
            this.recenter()
        }, 100);

        this.internalShow();
    };
    protected render(): HTMLElement {
        return (
            <Dialog>
                <DialogHeader style={{ textAlign: "center" }}>
                    <h1>R20ES - Changelog</h1>
                </DialogHeader>


                <DialogBody>
                    <ChangelogWidget/>
                </DialogBody>

                <section style={{ margin: "20px" }}>
                    <input
                        className="btn"
                        style={{ width: "100%", height: "auto", boxSizing: "border-box" }}
                        type="button"
                        onClick={this.close}
                        value="OK" />
                </section>

            </Dialog> as any
        );
    }
}
