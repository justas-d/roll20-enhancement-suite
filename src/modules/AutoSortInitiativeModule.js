import { R20Module } from "../tools/R20Module";
import { R20 } from "../tools/R20";

class AutoSortInitiativeModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__filename);

        this.isWorking = false;
        this.doSorting = this.doSorting.bind(this);
        this.onTurnOrderChanged = this.onTurnOrderChanged.bind(this);
        this.localInitiativeData = [];

        this.debouncedDoSorting = _.debounce(this.doSorting, 500);
        
    }

    getNew(a, b) {
        let added = [];

        for(const bObj of b) {
            let has = false;

            for(const aObj of a) {
                if(aObj.id === bObj.id && aObj.pr === bObj.pr) {
                    has = true;
                    break;
                }
            }

            if(!has) {
                added.push(bObj);
            }
        }

        return added;
    }

    setLocalInitiative(initiative) {
        const clone = JSON.parse(JSON.stringify(initiative));
        this.localInitiativeData = clone;
    }

    doSorting() {

        const old = this.localInitiativeData;
        let initiative = R20.getInitiativeData();

        const newData = this.getNew(old, initiative);
        this.setLocalInitiative(initiative);

        if (newData.length <= 0) return;
        if (initiative.length <= 0) return;

        try {
            if (old.length <= 0) {
                console.log("NEW INITIATIVE");

                // we added the very first tokens to the initiative.
                // in this state we don't have a "First token", only a list of
                // tokens that have started the initiative.
                // therefore we just sort the whole list.

                const hook = this.getHook();
                const ordering = R20.initiativeOrdering[hook.config.sortBy];

                R20.orderInitiativeBy(ordering);
            } else {
                console.log("APPENDING NEW TOKENS");

                // now we have tokens joining others that already exist in the list.
                // now we sort and respect the location of the first token.

                const firstToken = initiative[0];
                const hook = this.getHook();
                const ordering = R20.initiativeOrdering[hook.config.sortBy];

                R20.orderInitiativeBy(ordering);

                initiative = R20.getInitiativeData();

                let firstTokenNewIdx = null;
                for (let i = 0; i < initiative.length; i++) {
                    if (_.isEqual(initiative[i], firstToken)) {
                        firstTokenNewIdx = i;
                        break;
                    }
                }

                if (firstTokenNewIdx === null) {
                    console.error("Could not find firstTokenNewIdx")
                    console.error(initiative);
                    console.error(newToken);
                    return;
                }

                let properInitiative = [];

                for (let i = firstTokenNewIdx; i < initiative.length; i++) {
                    properInitiative.push(initiative[i]);
                }

                for (let i = 0; i < firstTokenNewIdx; i++) {
                    properInitiative.push(initiative[i]);
                }

                this.setLocalInitiative(properInitiative);
                R20.setInitiativeData(properInitiative);
            }
        } catch (err) {
            console.error(err);
            this.setLocalInitiative(R20.getInitiativeData());
        }
    }

    onTurnOrderChanged(e) {
        this.debouncedDoSorting();
    }

    setup() {
        if (!R20.isGM()) return;
        

        R20.getInitiativeWindow().model.on("change:turnorder", this.onTurnOrderChanged);
        this.setLocalInitiative(R20.getInitiativeData());
    }

    dispose() {
        super.dispose();
        R20.getInitiativeWindow().model.off("change:turnorder", this.onTurnOrderChanged);
    }
}

if (R20Module.canInstall()) new AutoSortInitiativeModule().install();

export default R20Module.makeHook(__filename, {
    id: "autoSortInitiative",
    name: "Auto-Sort Initiative",
    description: "Automatically sorts initiative order when a new token has been added to it by any player. After the list has been sorted, it is reorganized so that the token that was first in the list before the sort is still the first in the list after the sort.",
    category: R20Module.category.initiative,
    gmOnly: true,

    configView: {
        sortBy: {
            display: "Sort-By",
            type: "dropdown",

            dropdownValues: {
                numericAscending: "Numerically: Ascending",
                numericDescending: "Numerically: Descending",
                alphabetical: "Alphabetically: A-Z",
                alphabeticalDescending: "Alphabetically: Z-A",
                card: "By Card/Suit"
            }
        }
    },

    config: {
        sortBy: "numericDescending"
    },
});
