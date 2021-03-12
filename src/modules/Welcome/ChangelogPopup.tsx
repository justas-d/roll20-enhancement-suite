import { DOM } from "../../utils/DOM";
import { DialogBase } from "../../utils/DialogBase";
import { Dialog, DialogHeader, DialogBody } from "../../utils/DialogComponents";
import ChangelogWidget from "../ChangelogWidget";

export default class ChangelogPopup extends DOM.ElementBase {
    protected internalRender(): HTMLElement {
        return (
            <div className="r20es-welcome">
                <h2>VTTES has been updated</h2>
                <ChangelogWidget listAllVersions={false}/>
                <input
                    className="btn"
                    style={{ width: "100%", height: "auto", boxSizing: "border-box" }}
                    type="button"
                    onClick={this.dispose}
                    value="OK" 
                />
            </div> as any
        );
    }
}
