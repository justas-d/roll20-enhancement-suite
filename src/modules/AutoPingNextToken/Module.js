import { R20Module } from "../../tools/R20Module";
import { R20 } from "../../tools/R20";

class AutoPingNextTokenModule extends R20Module.SimpleBase {
    constructor() {
        super(__dirname);
    }

    ping(data) {
        if (!data.id) return;

        const obj = R20.getCurrentPageTokenByUUID(data.id);

        if (!obj) return;

        if (obj.model.get("layer") !== "objects") return;
        R20.ping(obj.left, obj.top, null, null, R20.CanvasLayer.PlayerTokens);
    }

    setup() {
        if (!R20.isGM()) return;

        window.r20es.pingInitiativeToken = this.ping;
    }

    dispose() {
        window.r20es.pingInitiativeToken = null;
    }
}

if (R20Module.canInstall()) new AutoPingNextTokenModule().install();

