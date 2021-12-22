import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";

class AutoSelectNextTokenModule extends R20Module.SimpleBase {
    constructor() {
        super(__dirname);
    }

    private static select(data: Roll20.Token) {
        if(!data.id) return;

        let obj = R20.getCurrentPageTokenByUUID(data.id);

        if (obj) {
            R20.selectToken(obj);
        }
    }

    public setup() {
        if(!R20.isGM()) return;

        window.r20es.selectInitiativeToken = AutoSelectNextTokenModule .select;
    }

    public dispose() {
        window.r20es.selectInitiativeToken = null;
    }
}

export default () => {
  new AutoSelectNextTokenModule().install();
};

