import { R20Module } from "../../utils/R20Module";
import { replaceAll } from "../../utils/MiscUtils";
import { R20 } from "../../utils/R20";

class ChangeIdWhenDuplicatingModule extends R20Module.SimpleBase {
  public constructor() {
    super(__dirname);
  }

  private static doReplace(original: Roll20.CharacterEditor, clone: Roll20.Character) {
    return replaceAll(
      original.model._blobcache.defaulttoken, 
      original.model.get("id"), 
      clone.get("id")
    );
  }

  public setup() {
    if(!R20.isGM()) {
      return;
    }
    
    window.r20es.replaceIdOnDupe = ChangeIdWhenDuplicatingModule .doReplace;
  }

  public dispose() {
    window.r20es.replaceIdOnDupe = null;
  }
}

export default () => {
  new ChangeIdWhenDuplicatingModule().install();
};

