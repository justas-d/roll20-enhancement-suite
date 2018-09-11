import { R20Module } from "../../tools/R20Module";
import { R20 } from "../../tools/R20";
import {Token} from "roll20";

class AutoPingNextTokenModule extends R20Module.SimpleBase {
    public constructor() {
        super(__dirname);
    }

    private static ping(data: Token) {
        if (!data.id) return;

        const obj = R20.getCurrentPageTokenByUUID(data.id);

        if (!obj) return;

        if (obj.model.get("layer") !== "objects") return;
        R20.ping(obj.left, obj.top, null, null, R20.CanvasLayer.PlayerTokens);
    }

    public setup() {
        if (!R20.isGM()) return;

        window.r20es.pingInitiativeToken = AutoPingNextTokenModule.ping;
    }

    public dispose() {
        window.r20es.pingInitiativeToken = null;
    }
}

if (R20Module.canInstall()) new AutoPingNextTokenModule().install();

