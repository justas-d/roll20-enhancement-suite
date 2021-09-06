import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";
import {EventSubscriber} from "../../utils/EventSubscriber";
import { DIALOG_OPEN_DELAY_KEY } from "./Constants";

class AutoOpenInitiativeTrackerModule extends R20Module.OnAppLoadBase {
    private _sub: EventSubscriber;

    public constructor() {
        super(__dirname);
        this._sub = R20.onInitiativeChange(this.onTurnOrderChanged);
    }

    private onTurnOrderChanged = (e) => {
        const cfg = this.getHook().config;
        const delay = cfg[DIALOG_OPEN_DELAY_KEY];

        setTimeout(() => {
            R20.getInitiativeWindow().model.save({
                initiativepage: true
                });
        }, delay);
    };

    public setup() {
        if (!R20.isGM()) return;
        this._sub.subscribe();
    }

    public dispose() {
        super.dispose();
        this._sub.unsubscribe();
    }
}

export default () => {
  new AutoOpenInitiativeTrackerModule().install();
};

