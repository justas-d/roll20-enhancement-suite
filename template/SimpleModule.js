/*
    This is the simple module.
    It's loaded ASAP during boot.
*/

import { R20Module } from "../tools/R20Module"

class MySimpleModule extends R20Module.SimpleBase {
    constructor() {
        super(__filename);
        // ctor
    }

    setup() { 
        // called when when installed at any time (i.e the VTT is loading, the module was disabled then reeanbled)
        // super.installFirstTime and super.installUpdate both call this.
    }

    dispose() { 
        // called when the module is being disabled (i.e user disabled the module, ext is reloading)
    }
}
