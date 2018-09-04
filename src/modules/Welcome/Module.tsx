import { R20Module } from "../../tools/R20Module";
import { DOM } from "../../tools/DOM";
import { getExtUrlFromPage, copy } from "../../tools/MiscUtils";
import { DialogBase } from "../../tools/DialogBase";
import WelcomePopup from "./WelcomePopup";
import ConfirmWorkingPopup from "./ConfirmWorkingPopup";
import ChangelogPopup from "./ChangelogPopup";

declare namespace build {
    export const R20ES_VERSION: string;
}

class WelcomeModule extends R20Module.OnAppLoadBase {
    private welcome: WelcomePopup;
    private popup: ConfirmWorkingPopup;
    private changelog: ChangelogPopup;

    public constructor() {
        super(__dirname);
    }

    public setup() {

        const root = document.getElementById("playerzone");
        let elem = null;

        const cfg = this.getHook().config;

        console.table({
            "showChangelog": cfg.showChangelog,
            "cfg.previousVersion": cfg.previousVersion,
            "R20ES_VERSION": build.R20ES_VERSION,
        });

        if (true || cfg.showStartupGuide) {
            this.welcome = new WelcomePopup(this);
            elem = this.welcome.render();
        } else if (cfg.showChangelog && cfg.previousVersion !== build.R20ES_VERSION) {
            //this.setConfigValue("previousVersion", build.R20ES_VERSION);
            this.changelog = new ChangelogPopup();
            elem = this.changelog.render();
        } else if (cfg.showWelcomePopup) {
            this.popup = new ConfirmWorkingPopup();
            elem = this.popup.render();
        }

        if (elem) {
            root.parentElement.insertBefore(elem, root);
        }
    }

    public dispose() {
        super.dispose();
        if (this.welcome) this.welcome.dispose();
        if (this.popup) this.popup.dispose();
    }
}

if (R20Module.canInstall()) new WelcomeModule().install();
