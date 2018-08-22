/*
    This is the on app load module.
    It's loaded when the onAppLoad event fires (when the loading screen fades)
*/

import { R20Module } from "../tools/R20Module"

class MyOnAppLoadModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__filename);
        // ctor
    }

    setup() { 
        // called when when installed at any time (i.e the VTT is loading, the module was disabled then reeanbled)
        // super.installFirstTime and super.installUpdate both call this.
    }

    dispose() { 
        super.dispose(); // DON'T FORGET THIS!
        
        // called when the module is being disabled (i.e user disabled the module, ext is reloading)
    }
}
