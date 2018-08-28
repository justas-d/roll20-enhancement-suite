import { R20Module } from "../tools/R20Module";
import { R20 } from "../tools/R20";

class AutoSelectNextTokenModule extends R20Module.SimpleBase {

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

if (R20Module.canInstall()) new AutoSelectNextTokenModule(__filename).install();

const hook = R20Module.makeHook(__filename,{
    id: "autoSelectNextToken",
    name: "Select Token",
    description: "When advancing initiative, this module will automatically select the next token in the initiative order.",
    category: R20Module.category.initiative,
    gmOnly: true,
    media: {
        "select_token.webm": "Automated token selection"
    },

    includes: "assets/app.js",
    find: "e.push(t[0]);",
    patch: "e.push(t[0]);if(window.r20es && window.r20es.selectInitiativeToken) { window.r20es.selectInitiativeToken(e[0]);}"
});

export { hook as AutoSelectNextTokenHook }
