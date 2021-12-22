import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";
import * as _ from 'underscore'
import {EventSubscriber} from "../../utils/EventSubscriber";

class AutoSortInitiativeModule extends R20Module.OnAppLoadBase {
    private localInitiativeData: Roll20.InitiativeData[] = [];
    private debouncedDoSorting: () => void;

    private _sub: EventSubscriber;

    public constructor() {
        super(__dirname);

        this.debouncedDoSorting = _.debounce(this.doSorting, 1000);
        this._sub = R20.onInitiativeChange(this.onTurnOrderChanged);
    }

    private onTurnOrderChanged = (e) => this.debouncedDoSorting();

    private static getNew(
      a: Roll20.InitiativeData[], 
      b: Roll20.InitiativeData[]
    ): Roll20.InitiativeData[] {
        let added: Roll20.InitiativeData[] = [];

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

    private setLocalInitiative(initiative: Roll20.InitiativeData[]) {
        // Note(Justas): clone or else it ain't workin'
        this.localInitiativeData = JSON.parse(JSON.stringify(initiative));
    }

    private doSorting = () => {
        let initiative = R20.getInitiativeData();

        const newData = AutoSortInitiativeModule.getNew(this.localInitiativeData, initiative);
        this.setLocalInitiative(initiative);

        if (newData.length <= 0) return;
        if (initiative.length <= 0) return;

        const cfg = this.getHook().config;

        try {
            if (this.localInitiativeData.length <= 0 || !cfg.respectFirstTokenPosition) {
                console.log("NEW INITIATIVE");

                // Note(Justas): we added the very first tokens to the initiative.
                // in this state we don't have a "First token", only a list of
                // tokens that have started the initiative.
                // therefore we just sort the whole list.

                const hook = this.getHook();
                const ordering = hook.config.sortBy;

                R20.orderInitiativeBy(ordering);
            } else {
                console.log("APPENDING NEW TOKENS");

                // Note(Justas): now we have tokens joining others that already exist in the list.
                // now we sort and respect the location of the first token.

                const firstToken = initiative[0];
                const hook = this.getHook();
                const ordering = hook.config.sortBy;

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
    };

    public setup() {
        if (!R20.isGM()) return;

        this._sub.subscribe();
        this.setLocalInitiative(R20.getInitiativeData());
    }

    public dispose() {
        super.dispose();
        this._sub.unsubscribe();
    }
}

export default () => {
  new AutoSortInitiativeModule().install();
};

