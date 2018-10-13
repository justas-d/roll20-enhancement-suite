type EventFx = (ev: string, cb: any) => void;

export interface IDOMEventEmitter {
    addEventListener: EventFx;
    removeEventListener: EventFx;
}

export interface IJqueryEventEmitter {
    on: EventFx;
    off: EventFx;
}

type EventEmitter = IDOMEventEmitter | IJqueryEventEmitter;


export class EventSubscriber {
    private _name: string;
    private _callback: any;
    private _targetGetter: () => EventEmitter;

    private _isSubscribed = false;

    public constructor(eventName: string, callback: any, targetGetter: () => EventEmitter) {
        this._name = eventName;
        this._callback = callback;
        this._targetGetter = targetGetter;
    }

    public static subscribe(eventName: string, callback: any, targetGetter: () => EventEmitter): EventSubscriber {
        const ev = new EventSubscriber(eventName, callback, targetGetter);
        ev.subscribe();
        return ev;
    }

    public subscribe() {
        if (this._isSubscribed) return;
        const target = this._targetGetter();

        if("on" in target) {
            target.on(this._name, this._callback)
        } else {
            target.addEventListener(this._name, this._callback);
        }

        this._isSubscribed = true;
    }

    public unsubscribe() {
        if (!this._isSubscribed) return;
        const target = this._targetGetter();

        if("off" in target) {
            target.off(this._name, this._callback);
        } else {
            target.removeEventListener(this._name, this._callback);
        }

        this._isSubscribed = false;
    }
}
