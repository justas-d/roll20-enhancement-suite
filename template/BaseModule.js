/*
    This is the barebones base module template.
    You might want to use something more higher level like OnAppLoadBase or SimpleBase.
    It's loaded ASAP during boot.
*/

import { R20Module } from "../tools/R20Module"

class MyBaseModule extends R20Module.Base {
    constructor() {
        super(__filename);
        // ctor
    }

    installFirstTime() { 
        // called when installed for the first time (i.e the VTT is loading)
    }

    installUpdate() { 
        // called when installed for the second and every other time (i.e after reloading, disabling and reenabling)
    }

    dispose() { 
        // called when the module is being disabled (i.e user disabled the module, ext is reloading)
    }
}
