import { R20Module } from "../../tools/R20Module";
import { DOM } from "../../tools/DOM";
import { findByIdAndRemove } from "../../tools/MiscUtils";
import SettingsDialog from "./SettingsDialog";

export default class SettingsModule extends R20Module.OnAppLoadBase {
    public static readonly buttonId = "r20es-settings-button";
    private dialog: SettingsDialog = null;

    constructor() {
        super(__dirname);
    }

    onButtonClick = (e: any) => {
        e.stopPropagation();
        this.dialog.show();
    }

    setup() {
        this.dialog = new SettingsDialog(this.getAllHooks());

        const adjacent = document.getElementById("exitroll20game");

        const button = <input
            type="button"
            style={{ marginBottom: "8px", width: "calc(100% - 21px)" }}
            id={SettingsModule.buttonId}
            className="btn"
            value="R20ES Settings"
            onClick={this.onButtonClick}
        />;

        adjacent.parentNode.parentNode.insertBefore(button, adjacent.parentNode);
    }

    dispose() {
        super.dispose();
        findByIdAndRemove(SettingsModule.buttonId);
        if (this.dialog) this.dialog.dispose();
    }
}

if (R20Module.canInstall()) new SettingsModule().install();
