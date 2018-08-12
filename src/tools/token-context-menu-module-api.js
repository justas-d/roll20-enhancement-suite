import { findByIdAndRemove } from "./miscUtil";

let TokenContextMenuApi = {}

TokenContextMenuApi.getInternalData = function() {
    return window.r20es.tokenContextMenu;
}

TokenContextMenuApi.setupInternalData = function() {
    window.r20es.tokenContextMenu = {
        widgets: [],
        idTop: 0,
    };
}

TokenContextMenuApi.addButton = function(text, callback, _options) {
    /*
        Options:
            mustHaveSelection: boolean -> only add the menu item when there is one or more object selected
    */

    const data = TokenContextMenuApi.getInternalData();
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

TokenContextMenuApi.removeButton = function(text, callback) {
    const all = TokenContextMenuApi.getInternalData().widgets;
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

export {TokenContextMenuApi};