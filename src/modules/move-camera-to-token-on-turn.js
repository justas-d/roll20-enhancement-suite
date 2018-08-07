import {R20Module } from "../tools/r20Module";
import { R20 } from "../tools/r20api";

class MoveCameraToTokenModule extends R20Module.SimpleBase {
    setup() {
        console.log("MoveCameraToTokenModule SETUP");

        window.r20es.moveCameraTo = R20.moveCameraTo;
    }
}

if(R20Module.canInstall()) new MoveCameraToTokenModule(__filename).install();

const hook = {
    id: "autoFocusNextToken",
    name: "Move camera to token on its turn",
    description : "Automatically moves the local camera to the token on it's turn. The camera movement is local only, meaning only your camera will move.",
    category: R20Module.category.initiative,
    gmOnly: true,

    find: "e.push(t[0]);",
    patch: "e.push(t[0]);window.r20es.moveCameraTo(e[0]);"
};

export {hook as AutoFocusNextToken};