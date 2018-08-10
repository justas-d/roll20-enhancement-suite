import { basename, safeCall } from "../tools/miscUtil";

let R20Module = {};

R20Module.Base = class ModuleBase {
    constructor(filename) {
        this.filename = basename(filename);
    }

    installFirstTime() { }
    installUpdate() { }
    dispose() { }

    getHook() {
        if(!("r20esDisposeTable" in window)) return null;
        if(!("hooks") in window.r20es) return null;

        for(const hookId in window.r20es.hooks) {
            const hook = window.r20es.hooks[hookId];
            if(hook.filename && hook.filename === this.filename) {
                return hook;
            }
            
        }

        return null;
    }

    install() {
        if(!("r20esDisposeTable" in window)) return;

        console.log(`Installing module ID: ${this.filename}`);

        let isFirstRun = window.r20esDisposeTable[this.filename] === undefined || window.r20esDisposeTable[this.filename] === null;

        if (isFirstRun) {
            console.log(`First run`);
            safeCall(_ => this.installFirstTime());
        } else {
            // dispose
            console.log(`Disposing old`);
            try {
                const oldDispose = window.r20esDisposeTable[this.filename];
                oldDispose();
            } catch (err) {
                console.error(`Failed to dispose but still continuing:`);
                console.error(err);
            }

            console.log(`Calling install update`);
            safeCall(_ => this.installUpdate());
        }

        window.r20esDisposeTable[this.filename] = _ => { this.dispose(); };

        console.log(`DONE! module ID: ${this.filename}`);
    }
}

R20Module.SimpleBase = class SimpleModuleBase extends R20Module.Base {
    installFirstTime() { this.setup() }
    installUpdate() { this.setup() }

    setup() { }
}

R20Module.OnAppLoadBase = class OnAppLoadModuleBase extends R20Module.Base {
    constructor(id) {
        super(id);

        this.setup = this.setup.bind(this);
    }

    installFirstTime() {
        if (window.r20es.isLoading) {
            window.r20es.onAppLoad.addEventListener(this.setup);
        } else {
            this.setup();
        }
    }

    setup() { }

    installUpdate() {
        this.installFirstTime();
    }

    dispose() {
        window.r20es.onAppLoad.removeEventListener(this.setup);
    }
}

R20Module.canInstall = _ => window.r20es && "canInstallModules" in window.r20es && window.r20es.canInstallModules;

R20Module.makeHook = function (filename, hook) {
    hook.filename = basename(filename);
    return hook;
}

R20Module.category = {
    canvas: "Canvas",
    exportImport: "Exporting/Importing",
    initiative: "Initiative",
    token: "Token",
    journal: "Journal",
}

export { R20Module };