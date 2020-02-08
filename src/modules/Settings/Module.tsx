import {R20Module} from "../../utils/R20Module";
import {DOM} from "../../utils/DOM";
import {findByIdAndRemove} from "../../utils/MiscUtils";
import SettingsDialog from "./SettingsDialog";
import ButtonId from "./Vars";
import {SettingsSidebarButton} from "../../Components/SettingsSidebarButton";
import {insertButtonIntoSettings} from "../../utils/InsertButtonIntoSettings";

class SettingsModule extends R20Module.OnAppLoadBase {
    private dialog: SettingsDialog = null;

    constructor() {
        super(__dirname);
    }

    onButtonClick = (e: any) => {
        e.stopPropagation();
        this.dialog.show();
    };

    setup() {
        this.dialog = new SettingsDialog(this.getAllHooks());

        const button = (
            <SettingsSidebarButton
                text="VTTES Settings"
                id={ButtonId}
                onClick={this.onButtonClick}
            />);

        insertButtonIntoSettings(button);
    }

    dispose() {
        super.dispose();
        findByIdAndRemove(ButtonId);
        if (this.dialog) this.dialog.dispose();
    }
}

if (R20Module.canInstall()) new SettingsModule().install();
