import { R20Module } from "../../tools/R20Module";
import { replaceAll } from "../../tools/MiscUtils";
import { R20 } from "../../tools/R20";

class ChangeIdWhenDuplicatingModule extends R20Module.SimpleBase {
    constructor() {
        super(__dirname);
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
