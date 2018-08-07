let R20Module = {};

R20Module.Base = class ModuleBase {
    constructor(id) {
        this.id = id;
    }

    installFirstTime() { }
    installUpdate() { }
    dispose() { }

    install() {
        console.log(`Installing module ID: ${this.id}`);

        let isFirstRun = window.r20esDisposeTable[this.id] === undefined || window.r20esDisposeTable[this.id] === null;

        if (isFirstRun) {
            console.log(`First run`);
            this.installFirstTime();
        } else {
            // dispose
            console.log(`Disposing old`);
            try {
                const oldDispose = window.r20esDisposeTable[this.id];
                oldDispose();
            } catch (err) {
                console.error(`Failed to dispose but still continuing:`);
                console.error(err);
            }

            console.log(`Calling install update`);
            this.installUpdate();
        }

        window.r20esDisposeTable[this.id] = _ => { this.dispose(); };

        console.log(`DONE! module ID: ${this.id}`);
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

R20Module.category = {
    canvas: "Canvas",
    exportImport: "Exporting/Importing",
    initiative: "Initiative",
    token: "Token",
    journal: "Journal",
}

export { R20Module };