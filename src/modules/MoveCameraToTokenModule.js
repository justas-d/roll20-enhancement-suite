import {R20Module } from "../tools/R20Module";
import { R20 } from "../tools/R20";

class MoveCameraToTokenModule extends R20Module.SimpleBase {
    setup() {
        if(!R20.isGM()) return;

        window.r20es.moveCameraTo = (d) => { 
            if(!d) return; 
            R20.moveCameraToTokenByUUID(d.id)
        };
    }

    dispose() {
        window.r20es.moveCameraTo = null;
    }
}

if(R20Module.canInstall()) new MoveCameraToTokenModule(__filename).install();

const hook = R20Module.makeHook(__filename,{
    id: "autoFocusNextToken",
    name: "Move Camera to Token",
    description : "When advancing initiative, this module will move your camera to the next token in the initiative order. This camera movement is local, meaning other players will not have their camera moved.",
    category: R20Module.category.initiative,
    gmOnly: true,
    media: {
        "move_cam.webm": "Camera moving between 4 tokens"
    },

    includes: "assets/app.js",
    find: "e.push(t[0]);",
    patch: `e.push(t[0]);
    if(window.r20es && window.r20es.moveCameraTo) { window.r20es.moveCameraTo(e[0]); }`
});

export {hook as AutoFocusNextToken};
