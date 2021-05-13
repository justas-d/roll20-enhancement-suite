import {R20Module} from "../../utils/R20Module";
import {DOM} from "../../utils/DOM";
import {getExtUrlFromPage} from "../../utils/MiscUtils";
import WelcomePopup from "./WelcomePopup";
import ChangelogPopup from "./ChangelogPopup";
import {R20} from "../../utils/R20";
import {Config} from "../../utils/Config";

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
<h2 style="color: whitesmoke">VTT Enhancement Suite</h2>
<span>The enhancement suite (aka R20ES) v${build.R20ES_VERSION} has been loaded!</span>
<br/>
<br/>

<a href="${Config.discordInvite}">
    <img style="width: 26px; height: 26px" src="https://discordapp.com/assets/1c8a54f25d101bdc607cec7228247a9a.svg"/>
    <span style="color: orange;  margin-left:5px"> 
        Discord Server
    </span>
</a>

<br/>

<a class="bmc-button" target="_blank" href=${Config.contributeUrl}>
    <span style="color: orange; margin-left:5px">
      <img style="margin-right: 5px; width: 26px; height: 26px" src="https://github.com/justas-d/roll20-enhancement-suite/raw/b7db254d7c6487ac54f1fb8d6d5aeb966306f813/assets/promotional/Digital-Patreon-Logo_FieryCoral.png" alt=""></img>Patreon
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

        console.log(`showChangelog: ${cfg.showChangelog}`);
        console.log(`cfg.previousVersion": ${cfg.previousVersion}`);
        console.log(`R20ES_VERSION": ${build.R20ES_VERSION}`);

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
