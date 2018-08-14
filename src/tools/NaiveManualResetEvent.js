class NaiveManualResetEvent {
    constructor(timeout, freq) {
        this.signalled = false;
        this.frequency = (freq === undefined || freq === null) ? 100 : freq;
        this.timeout = timeout;
        this.waited = 0;
    }
    set() {
        this.signalled = true;
    }

    _doWaiting() {
        this.dateStarted = new Date();

        setTimeout(() => {
            const dateEnded = new Date();
            const diff = dateEnded - this.dateStarted;

            const didTimeout = this.waited >= this.timeout;
            if (this.signalled || didTimeout) {
                if (this.fx) this.fx(didTimeout);
            } else {
                this.waited += diff;
                this._doWaiting();
            }
        }, this.frequency);
    }

    reset() {
        this.signalled = false;
        this.waited = 0;
        this.fx = null;
    }

    whenDone(doWhat) {
        this.fx = doWhat;
        this._doWaiting();
    }
}

export { NaiveManualResetEvent};
