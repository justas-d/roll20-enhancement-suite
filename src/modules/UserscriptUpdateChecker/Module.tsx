import {R20Module} from "../../utils/R20Module";
import {DOM} from "../../utils/DOM";
import {R20} from "../../utils/R20";
import {Config} from "../../utils/Config";

class UserscriptUpdateChecker extends R20Module.OnAppLoadBase {
  public constructor() {
    super(__dirname);
  }

  public setup() {

    const coroutines = async () => {
      try {
        const request = await fetch("https://justas-d.github.io/roll20-enhancement-suite/vttes.meta.js");
        let text = await request.text();
        text = text.trim();

        let version_start_idx = -1;
        let version_end_idx = -1;
        for(let index = text.indexOf("version");
            index < text.length;
            index += 1
        ) {
          let c = text[index];

          if(version_start_idx == -1) {
            if(c == '1' || c == '2' || c == '3' || c == '4' || c == '5' || 
               c == '6' || c == '7' || c == '8' || c == '9' || c == '9'
            ) {
              version_start_idx = index;
            }
          }
          else if(version_end_idx == -1) {
            if(c == '\n') {
              version_end_idx = index;
              break;
            }
          }
        }
        if(version_end_idx != -1 && version_start_idx != -1) {
          let version_string = text.substring(version_start_idx, version_end_idx).trim();
          console.log(`Latest userscript version: '${version_string}'`);

          if(version_string != BUILD_CONSTANT_VERSION) {
            R20.saySystem(`
<h2 style="color: whitesmoke">Update Available!</h2>
<div>VTTES Userscript has an update available.</div>
<div>Please <a style="color: orange;" href="https://justas-d.github.io/roll20-enhancement-suite/userscript_update.webm">check for updates</a> in Tampermonkey</div>
<div>Or grab it <a style="color: orange;" href="https://justas-d.github.io/roll20-enhancement-suite/vttes.user.js">here</a>.</div>
`);
          }
          else {
            console.log("Userscript is up to date!");
          }
        }
      } catch(err) {
        console.error("VTTES: failed to check for new version", err);
      }
    };

    setTimeout(coroutines, 4000);
  }

  public dispose() {
    super.dispose();
  }
}

export default () => {
  new UserscriptUpdateChecker().install();
};

