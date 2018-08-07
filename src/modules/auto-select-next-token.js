import { R20Module } from "../tools/r20Module";
import { R20 } from "../tools/r20api";

class AutoSelectNextTokenModule extends R20Module.SimpleBase {
    setup() {

        window.r20es.selectInitiativeToken = function (data) {

            let obj = R20.getCurrentPageTokenByUUID(data.id);

            if (obj) {
                R20.selectToken(obj);
            }
        }

    }
}

if (R20Module.canInstall()) new AutoSelectNextTokenModule(__filename).install();

const hook = {
    id: "autoSelectNextToken",
    name: "Select token on its turn",
    description: "Automatically selects a token on it's turn",
    category: R20Module.category.initiative,
    gmOnly: true,

    find: "e.push(t[0]);",
    patch: "e.push(t[0]);window.r20es.selectInitiativeToken(e[0]);"
};

export { hook as AutoSelectNextTokenHook }