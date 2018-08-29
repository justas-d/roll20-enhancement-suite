import { R20Module } from "../../tools/R20Module";
import { R20 } from "../../tools/R20";

class AutoSelectNextTokenModule extends R20Module.SimpleBase {
    constructor() {
        super(__dirname);
    }

    select(data) {
        if(!data.id) return;

        let obj = R20.getCurrentPageTokenByUUID(data.id);

        if (obj) {
            R20.selectToken(obj);
        }
    }
    
    setup() {
        if(!R20.isGM()) return;

        window.r20es.selectInitiativeToken = this.select;
    }

    dispose() {
        window.r20es.selectInitiativeToken = null;
    }
}

if (R20Module.canInstall()) new AutoSelectNextTokenModule().install();
