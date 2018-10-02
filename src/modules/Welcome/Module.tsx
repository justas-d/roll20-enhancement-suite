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
                R20.saySystem(`
<h2 style="color: whitesmoke">Roll20 Enhancement Suite</h2>
<span>R20ES has been loaded!</span>
<br/>
<br/>

<a style="color: orange" href="${Config.discordInvite}">
    <img style="width: 26px; height: 26px" src="https://discordapp.com/assets/1c8a54f25d101bdc607cec7228247a9a.svg"/>
    <span style="margin-left:5px"> 
        Discord Server
    </span>
</a>

<br/>

<a style="color: orange" class="bmc-button" target="_blank" href=${Config.buyMeACoffee}>
    <img src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" alt="Buy me a coffee"/>
    <span style="margin-left:5px">
        Buy me a coffee
    </span>
</a>
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
