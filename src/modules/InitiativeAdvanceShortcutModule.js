import { R20Module } from "../tools/R20Module";
import { R20 } from "../tools/R20";

class InitiativeAdvanceShortcutModule extends R20Module.OnAppLoadBase {

    setup() {
        if (!R20.isGM()) return;

        const advance = _ => R20.advanceInitiative();

        Mousetrap.bind("ctrl+right", advance);
        Mousetrap.bind("meta+right", advance);

        this.wasBound = true;
    }

    dispose() {
        if (this.wasBound) {
            this.wasBound = false;
            Mousetrap.unbind("ctrl+right");
            Mousetrap.unbind("meta+right");
        }
    }
}

if (R20Module.canInstall()) new InitiativeAdvanceShortcutModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "initiativeShortcuts",
    name: "Initiative shortcuts",
    description: "Creates a shortcut for advancing (Ctrl+Right Arrow) in the initiative list.",
    category: R20Module.category.initiative,
    gmOnly: true,

});

export { hook as InitiativeAdvanceShortcutHook };
