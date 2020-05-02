import { DOM } from ".//DOM";
import {Config} from "./Config";
import {isChromium} from "./BrowserDetection";

export default function showProblemPopup(debugCode) {

    const popup = (
        <div className="r20es-welcome">
            <h2>VTTES - Uh oh!</h2>
            <p>Looks like loading is taking a while. There might be a bug somewhere.</p>
            <p>Please try:</p>
            <ul>
              <li>Refreshing the page.</li>
              <li>Disabling all other extensions.</li>
              {isChromium() && <li>Using Firefox.</li>}
            </ul>

            <p>If this persists, please visit the <a href={Config.discordInvite}>Discord server</a> and let us know.</p>

            <p className="r20es-code">
                {debugCode}
            </p>

            <button onClick={() => popup.remove()}>OK</button>
        </div> as any);

    const root = document.getElementById("playerzone");
    root.parentElement.insertBefore(popup, root);
}
