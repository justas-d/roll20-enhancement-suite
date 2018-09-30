import {R20Module} from "../../tools/R20Module";
import {DOM} from "../../tools/DOM";
import {getExtUrlFromPage} from "../../tools/MiscUtils";
import WelcomePopup from "./WelcomePopup";
import ChangelogPopup from "./ChangelogPopup";
import {R20} from "../../tools/R20";
import {Config} from "../../tools/Config";

declare namespace build {
    export const R20ES_VERSION: string;
}

class WelcomeModule extends R20Module.OnAppLoadBase {
    private welcome: WelcomePopup;
    private changelog: ChangelogPopup;

    public constructor() {
        super(__dirname);
    }

    private sendWelcomeMessage() {
        setTimeout(() => {

            const cfg = this.getHook().config;

            if (cfg.showWelcomePopup) {
                R20.saySystem(`<h2 style="color: whitesmoke">Roll20 Enhancement Suite</h2>
R20ES has been loaded!
<br/>
<br/>
Have a feature idea, issues?:
<br/>
<a style="color: orange" href="${Config.discordInvite}">Visit our Discord Server!</a>
<br/>
`);
            }
        }, 2000);
    }

    public setup() {

        const root = document.getElementById("playerzone");
        let elem = null;

        const cfg = this.getHook().config;

        this.sendWelcomeMessage();

        console.table({
            "showChangelog": cfg.showChangelog,
            "cfg.previousVersion": cfg.previousVersion,
            "R20ES_VERSION": build.R20ES_VERSION,
        });

        if (cfg.showStartupGuide) {
            this.welcome = new WelcomePopup(this);
            elem = this.welcome.render();
        } else if (cfg.showChangelog && cfg.previousVersion !== build.R20ES_VERSION) {
            this.changelog = new ChangelogPopup();
            elem = this.changelog.render();
        }

        this.setConfigValue("previousVersion", build.R20ES_VERSION);

        if (elem) {
            root.parentElement.insertBefore(elem, root);
        }
    }

    public dispose() {
        super.dispose();
        if (this.welcome) this.welcome.dispose();
    }
}

if (R20Module.canInstall()) new WelcomeModule().install();
