import { DOM } from "../../tools/DOM";
import { DialogBase } from "../../tools/DialogBase";
import { Dialog, DialogHeader, DialogBody } from "../../tools/DialogComponents";
import ChangelogWidget from "../ChangelogWidget";

declare namespace build {
    export const R20ES_VERSION: string;
}

export default class ChangelogPopup extends DOM.ElementBase {
    protected internalRender(): HTMLElement {
        return (
            <div className="r20es-welcome" onClick={this.dispose}>
                <h2>R20ES has been updated</h2>
                <ChangelogWidget />
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
