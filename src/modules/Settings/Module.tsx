import { R20Module } from "../../tools/R20Module";
import { DOM } from "../../tools/DOM";
import { findByIdAndRemove } from "../../tools/MiscUtils";
import SettingsDialog from "./SettingsDialog";
import ButtonId from "./Vars";

class SettingsModule extends R20Module.OnAppLoadBase {
    private dialog: SettingsDialog = null;

    constructor() {
        super(__dirname);
    }

    onButtonClick = (e: any) => {
        e.stopPropagation();
        this.dialog.show();
    }

    setup() {
        console.log("SETUP==========================================");
        this.dialog = new SettingsDialog(this.getAllHooks());

        const adjacent = document.getElementById("exitroll20game");

        const button = <input
            type="button"
            style={{ marginBottom: "8px", width: "calc(100% - 21px)" }}
            id={ButtonId}
            className="btn"
            value="R20ES Settings"
            onClick={this.onButtonClick}
        />;

        adjacent.parentNode.parentNode.insertBefore(button, adjacent.parentNode);
    }

    dispose() {
        super.dispose();
        findByIdAndRemove(ButtonId);
        if (this.dialog) this.dialog.dispose();
    }
}

if (R20Module.canInstall()) new SettingsModule().install();
