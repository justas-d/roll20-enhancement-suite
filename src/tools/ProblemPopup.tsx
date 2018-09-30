import { DOM } from "../tools/DOM";
import {Config} from "./Config";

export default function showProblemPopup(debugCode) {

    const popup = (
        <div className="r20es-welcome">
            <h2>R20ES - Uh oh!</h2>
            <p>Looks like something's not working. There might be a bug/problem somewhere.</p>
            <p>Try refereshing the page.</p>
            <p>If this persists, please visit the <a href={Config.discordInvite}>Discord server</a> and let us know.</p>

            <p className="r20es-code">
                {debugCode}
            </p>

            <button onClick={() => popup.remove()}>OK</button>
        </div> as any);

    const root = document.getElementById("playerzone");
    root.parentElement.insertBefore(popup, root);
}
