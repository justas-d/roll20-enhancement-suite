import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";

class InitiativeAdvanceShortcutModule extends R20Module.OnAppLoadBase {
    private wasBound: boolean = false;

    public  constructor() {
        super(__dirname);
    }
    
    public setup() {
        if (!R20.isGM()) return;

        const advance = () => R20.advanceInitiative();

        window.Mousetrap.bind("ctrl+right", advance);
        window.Mousetrap.bind("meta+right", advance);

        this.wasBound = true;
    }

    public dispose() {
        super.dispose();
        
        if (this.wasBound) {
            this.wasBound = false;
            window.Mousetrap.unbind("ctrl+right");
            window.Mousetrap.unbind("meta+right");
        }
    }
}

export default () => {
  new InitiativeAdvanceShortcutModule().install();
};

