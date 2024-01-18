import {R20Module} from "../../utils/R20Module";
import {DOM} from "../../utils/DOM";
import WelcomePopup from "./WelcomePopup";
import ChangelogPopup from "./ChangelogPopup";
import {R20} from "../../utils/R20";
import {Config} from "../../utils/Config";

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
<h2 style="font-size: 18px; color: whitesmoke">VTT Enhancement Suite</h2>
<span>The enhancement suite (aka R20ES) v${BUILD_CONSTANT_VERSION} has been loaded!</span>
<br/>
<br/>

<a href="${Config.discordInvite}">
<img style="margin-right: 5px; width: 26px; height: 26px" src="https://discordapp.com/assets/1c8a54f25d101bdc607cec7228247a9a.svg"/> <span style="color: orange;"><b>VTTES Discord Server</b></span>
</a>

<br/>

<a class="bmc-button" target="_blank" href=${Config.contributeUrl}>
<span style="color: orange; margin-left:5px">
<img style="margin-right: 5px; width: 26px; height: 26px" src="https://github.com/justas-d/roll20-enhancement-suite/raw/b7db254d7c6487ac54f1fb8d6d5aeb966306f813/assets/promotional/Digital-Patreon-Logo_FieryCoral.png" alt=""></img><b>Patreon</b>
</span>
</a>
`);

        if(BUILD_CONSTANT_TARGET_PLATFORM === "chrome") {
          R20.saySystem(`
<b>VTTES is now available as an auto-updating userscript for <img style="margin-left: 4px; margin-right: 4px; width: 26px; height: 26px" src="https://github.com/justas-d/roll20-enhancement-suite/raw/b7db254d7c6487ac54f1fb8d6d5aeb966306f813/assets/promotional/Digital-Patreon-Logo_FieryCoral.png" alt=""></img>Patrons!</b>
View the full details <a style="color: orange" class="bmc-button" target="_blank" href="https://justas-d.github.io/roll20-enhancement-suite/chrome.html">here</a>.
`);
        }
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
    console.log(`BUILD_CONSTANT_VERSION": ${BUILD_CONSTANT_VERSION}`);

    if(cfg.showStartupGuide) {
      this.welcome = new WelcomePopup(this);
      elem = this.welcome.render();
    } 
    else if(cfg.showChangelog && cfg.previousVersion !== BUILD_CONSTANT_VERSION) {
      this.changelog = new ChangelogPopup();
      elem = this.changelog.render();
    }

    this.setConfigValue("previousVersion", BUILD_CONSTANT_VERSION);

    if(elem) {
      root.parentElement.insertBefore(elem, root);
    }
  }

  public dispose() {
    super.dispose();
    if (this.welcome) {
      this.welcome.dispose();
    }
  }
}

export default () => {
  new WelcomeModule().install();
};

