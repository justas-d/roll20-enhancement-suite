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

                <section style={{ margin: "20px" }}>
                    <input
                        className="btn btn-primary"
                        style={{ width: "100%", height: "auto", boxSizing: "border-box" }}
                        type="button"
                        onClick={this.close}
                        value="OK" />
                </section>

            </Dialog> as any
        );
    }
}
