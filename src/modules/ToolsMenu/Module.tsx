import {R20Module} from "../../utils/R20Module";
import {DOM} from "../../utils/DOM";
import {findByIdAndRemove} from "../../utils/MiscUtils";
import {SettingsSidebarButton} from "../../Components/SettingsSidebarButton";
import {insertButtonIntoSettings} from "../../utils/InsertButtonIntoSettings";
import {ToolsDialog} from "./ToolsDialog";

class ToolsModule extends R20Module.OnAppLoadBase {
    private dialog: ToolsDialog = null;
    private static readonly TOOLS_ID = "r20es-tools-button";

    constructor() {
        super(__dirname);
    }

    onButtonClick = (e: any) => {
        e.stopPropagation();
        this.dialog.show();
    };

    setup() {
        this.dialog = new ToolsDialog();

        const button = (
            <SettingsSidebarButton
                id={ToolsModule.TOOLS_ID}
                text="VTTES Tools"
                onClick={this.onButtonClick}
            />);

        insertButtonIntoSettings(button);
    }

    dispose() {
        super.dispose();
        findByIdAndRemove(ToolsModule.TOOLS_ID);
        if (this.dialog) this.dialog.dispose();
    }
}

export default () => {
  new ToolsModule().install();
};

