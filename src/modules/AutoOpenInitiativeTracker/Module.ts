import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";
import {EventSubscriber} from "../../utils/EventSubscriber";

class AutoOpenInitiativeTrackerModule extends R20Module.OnAppLoadBase {
    private _sub: EventSubscriber;

    public constructor() {
        super(__dirname);
        this._sub = R20.onInitiativeChange(this.onTurnOrderChanged);
    }

    private onTurnOrderChanged = (e) => {
        R20.getInitiativeWindow().model.save({
            initiativepage: true
        });
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

if (R20Module.canInstall()) new AutoOpenInitiativeTrackerModule().install();
