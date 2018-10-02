import { DOM } from "../../tools/DOM";
import { DialogBase } from "../../tools/DialogBase";
import { Dialog, DialogHeader, DialogBody } from "../../tools/DialogComponents";
import ChangelogWidget from "../ChangelogWidget";

export default class ChangelogPopup extends DOM.ElementBase {
    protected internalRender(): HTMLElement {
        return (
            <div className="r20es-welcome">
                <h2>R20ES has been updated</h2>
                <ChangelogWidget listAllVersions={false}/>
                <input
                    className="btn btn-primary"
                    style={{ width: "100%", height: "auto", boxSizing: "border-box" }}
                    type="button"
                    onClick={this.dispose}
                    value="OK" 
                />
            </div> as any
        );
    }
}
