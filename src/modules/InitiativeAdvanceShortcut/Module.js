import { R20Module } from "../../tools/R20Module";
import { R20 } from "../../tools/R20";

class InitiativeAdvanceShortcutModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__dirname);
    }
    
    setup() {
        if (!R20.isGM()) return;

        const advance = _ => R20.advanceInitiative();

        Mousetrap.bind("ctrl+right", advance);
        Mousetrap.bind("meta+right", advance);

        this.wasBound = true;
    }

    dispose() {
        super.dispose();
        
        if (this.wasBound) {
            this.wasBound = false;
            Mousetrap.unbind("ctrl+right");
            Mousetrap.unbind("meta+right");
        }
    }
}

if (R20Module.canInstall()) new InitiativeAdvanceShortcutModule().install();
