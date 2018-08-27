import { R20Module } from "../tools/R20Module";
import { R20 } from "../tools/R20";

class AutoPingNextTokenModule extends R20Module.SimpleBase {
    
    ping(data) {
        if(!data.id) return;

        const obj = R20.getCurrentPageTokenByUUID(data.id);

        if (!obj) return;

        if (obj.model.get("layer") !== "objects") return;
        R20.ping(obj.left, obj.top, null, null, R20.layer.playerTokens);
    }

    setup() {
        if(!R20.isGM()) return;
        
        window.r20es.pingInitiativeToken = this.ping;
    }

    dispose() {
        window.r20es.pingInitiativeToken = null;
    }
}

if(R20Module.canInstall()) new AutoPingNextTokenModule(__filename).install();

const hook = R20Module.makeHook(__filename,{

    id: "autoPingNextToken",
    name: "Ping Visible Token",
    description: "When advancing initiative, this module will automatically ping the next token only if it is in the player token layer.",
    category: R20Module.category.initiative,
    gmOnly: true,

    includes: "assets/app.js",
    find: "e.push(t[0]);",
    patch: "e.push(t[0]);if(window.r20es && window.r20es.pingInitiativeToken) {window.r20es.pingInitiativeToken(e[0]);}"
});

export {hook as AutoPingNextTokenHook};
