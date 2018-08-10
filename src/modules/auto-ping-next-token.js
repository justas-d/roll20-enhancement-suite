import { R20Module } from "../tools/r20Module";
import { R20 } from "../tools/r20api";

class AutoPingNextTokenModule extends R20Module.SimpleBase {
    setup() {
        window.r20es.pingInitiativeToken = function (data) {
            if(!data.id) return;

            const obj = R20.getCurrentPageTokenByUUID(data.id)

            if (!obj) return;

            if (obj.model.get("layer") !== "objects") return;
            R20.ping(obj.left, obj.top, null, null, R20.layer.playerTokens);

        }
    }
}

if(R20Module.canInstall()) new AutoPingNextTokenModule(__filename).install();

const hook = R20Module.makeHook(__filename,{

    id: "autoPingNextToken",
    name: "Ping visible token on its turn",
    description: "Automatically pings a token on it's turn only if that token is on the player token layer.",
    category: R20Module.category.initiative,
    gmOnly: true,

    includes: "assets/app.js",
    find: "e.push(t[0]);",
    patch: "e.push(t[0]);window.r20es.pingInitiativeToken(e[0]);"
});

export {hook as AutoPingNextTokenHook};