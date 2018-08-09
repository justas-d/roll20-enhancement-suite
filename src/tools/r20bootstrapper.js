import { basename } from "../tools/miscUtil";

let R20Bootstrapper = {};

R20Bootstrapper.Base = class BootstrapperBase {
    constructor(filename) {
        this.filename = basename(filename);
    }

    beforeInject() { }
    afterInject() { }

    // "this" will be the new boostrap, has no access to previous "this"
    disposePrevious() { }

    bootstrap() {
        if(!window.bootstrapTable) return;
        const bootstrapTable = window.bootstrapTable;

        this.disposePrevious();
        console.log(`Adding ${this.filename} to bootstrap table.`);
        bootstrapTable[this.filename] = this;
    }
}

R20Bootstrapper.canBootstrap = _ => "bootstrapTable" in window && window.isR20esBootstrapping;

export { R20Bootstrapper };
