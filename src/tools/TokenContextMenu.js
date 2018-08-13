import { findByIdAndRemove } from "./MiscUtils";

let TokenContextMenu = {}

TokenContextMenu.getInternalData = function() {
    return window.r20es.tokenContextMenu;
}

TokenContextMenu.setupInternalData = function() {
    window.r20es.tokenContextMenu = {
        widgets: [],
        idTop: 0,
    };
}

TokenContextMenu.addButton = function(text, callback, _options) {
    /*
        Options:
            mustHaveSelection: boolean -> only add the menu item when there is one or more object selected
    */

    const data = TokenContextMenu.getInternalData();
    const id = `r20es-token-ctx-menu-button-${data.idTop++}`

    const payload =  {
        id,
        text, 
        callback,
    };
    
    if(_options)
        payload.options = _options;

    data.widgets.push(payload);
}

TokenContextMenu.removeButton = function(text, callback) {
    const all = TokenContextMenu.getInternalData().widgets;
    let idx = all.length; 

    while(idx --> 0) {
        const cur = all[idx];

        if(cur.text === text && cur.callback === callback) {
            findByIdAndRemove(cur.id);
            all.splice(idx, 1);
            return true;
        }
    }

    return false;
}

export {TokenContextMenu};
