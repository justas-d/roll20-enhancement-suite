import {R20Module } from "../../tools/R20Module";
import { R20 } from "../../tools/R20";

class MoveCameraToTokenModule extends R20Module.SimpleBase {
    constructor() {
        super(__dirname);
    }
    
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

if(R20Module.canInstall()) new MoveCameraToTokenModule().install();
