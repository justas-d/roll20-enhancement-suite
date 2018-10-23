import {removeByReference} from "./ArrayUtils";

export class EventEmitter {
    private _fxs: Function[] = [];

    public static copyExisting(emitter: EventEmitter | null): EventEmitter {
        const ee = new EventEmitter();
        if(emitter) {
            ee._fxs = [...emitter._fxs];
        }
        return ee;
    };

    public fire() {
        for(const fx of this._fxs) {
            try {
                fx();
            } catch(err) {
                console.error(err);
            }
        }
    }

    public on(fx: Function) {
        this._fxs.push(fx);
    }

    public off(fx: Function) {
        removeByReference(this._fxs, fx);
    }

    public addEventListener(fx: Function) {
        this.on(fx);
    }

    public removeEventListener(fx: Function) {
        this.off(fx);
    }
}
