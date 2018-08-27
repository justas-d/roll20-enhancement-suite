import { R20Module } from "../tools/R20Module";
import { replaceAll } from "../tools/MiscUtils";
import { R20 } from "../tools/R20";

class ChangeIdWhenDuplicatingModule extends R20Module.SimpleBase {
    constructor() {
        super(__filename);
    }

    doReplace(original, clone) {
        return replaceAll(original.model._blobcache.defaulttoken, original.model.get("id"), clone.get("id"));
    }

    setup() {
        if(!R20.isGM()) return;
        
        window.r20es.replaceIdOnDupe = this.doReplace;
    }

    dispose() {
        window.r20es.replaceIdOnDupe = null;
    }
}

if(R20Module.canInstall()) new ChangeIdWhenDuplicatingModule().install();

const hook = R20Module.makeHook(__filename, {
    id: "changeRepresentsIdWhenDuplicating",
    name: `Reassign "Represents" when duplicating`,
    description: "When duplicating a character in the journal and if that character has a default token, this module will reassign the \"Represents\" value of that default token to the newly duplicated character.",
    category: R20Module.category.token,
    gmOnly: true,

    includes: "assets/app.js",
    find: "o.defaulttoken=e.model._blobcache.defaulttoken",
    patch: `o.defaulttoken = ((window.r20es && window.r20es.replaceIdOnDupe) ? window.r20es.replaceIdOnDupe(e, n) : e.model._blobcache.defaulttoken)`
})

export { hook as ChangeIdWhenDuplicatingHook }
