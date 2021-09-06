import {R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";

class MoveCameraToTokenModule extends R20Module.SimpleBase {
    public constructor() {
        super(__dirname);
    }

    private static doMove(data) {
        if(!data) return;
        R20.moveCameraToTokenByUUID(data.id)
    }
    
    public setup() {
        if(!R20.isGM()) return;

        window.r20es.moveCameraTo = MoveCameraToTokenModule.doMove;
    }

    public dispose() {
        window.r20es.moveCameraTo = null;
    }
}

export default () => {
  new MoveCameraToTokenModule().install();
};

