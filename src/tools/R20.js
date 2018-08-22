let R20 = {};

R20.getHandout = function(uuid) {
    return window.Campaign.handouts.get(uuid);
}

R20.createCharacter = function (initialAttributes) {
    return window.Campaign.characters.create(initialAttributes);
}

R20.getCharacter = function (uuid) {
    return window.Campaign.characters.get(uuid);
}

R20.createRollableTable = function (initialAttributes) {
    return window.d20.Campaign.rollabletables.create(initialAttributes);
}

R20.getRollableTable = function (uuid) {
    return window.d20.Campaign.rollabletables.get(uuid);
}

R20.getSelectedTokens = function () {
    return window.d20.engine.selected();
}

R20.unselectTokens = function () {
    return window.d20.engine.unselect();
}

R20.addTokenToSelection = function (token) {
    window.d20.engine.select(token);
}

R20.selectToken = function (token) {
    R20.unselectTokens();
    R20.addTokenToSelection(token);
}

R20.hideTokenRadialMenu = function () {
    window.d20.token_editor.removeRadialMenu();
}

R20.hideTokenContextMenu = function () {
    window.d20.token_editor.closeContextMenu();
}

R20.getCurrentPlayer = function () {
    return window.currentPlayer;
}

R20.isGM = function () {
    return window.is_gm;
}

R20.getCurrentLayer = function () {
    return window.currentEditingLayer;
}        

R20.getCurrentToolName = function () {
    return window.d20.engine.mode;
}

R20.advanceInitiative = function () {
    window.d20.Campaign.initiativewindow.nextTurn();
}

R20.addTokenToInitiative = function(tokenUUID) {
    window.d20.Campaign.initiativewindow.addTokenToList(tokenUUID);
}

R20.addCustomItemToInitiative = function(name, formula) {
    window.d20.Campaign.initiativewindow.addTokenToList("-1", name, formula);
}

R20.orderInitiativeBy = function(initiativeOrdering) {
    const map = {
        [R20.initiativeOrdering.numericAscending]: ".sortlist_numeric",
        [R20.initiativeOrdering.numericDescending]: ".sortlist_numericdesc",
        [R20.initiativeOrdering.alphabetical]: ".sortlist_alpha",
        [R20.initiativeOrdering.alphabeticalDescending]: ".sortlist_alphadesc",
        [R20.initiativeOrdering.card]: ".sortlist_card"
    };

    if(!(initiativeOrdering in map)) {
        console.error(`Invalid initiative ordering: ${initiativeOrdering}`);
            return;
    }

    const selector = map[initiativeOrdering];

    // the buttons that we click have inline logic to close 
    // this dialog. jquery throws an error when a we try to close 
    // a dialog dialog that is not open.
    // so opening this dialog prevents errors.
    $("#initiativewindow_settings").dialog({
        modal: false,
        title: "Turn Order Settings",
        beforeClose: () => {}
    });

    $(selector).click();
}

R20.getInitiativeWindow = function() {
    return window.d20.Campaign.initiativewindow;
}

R20.getInitiativeData = function() {
    return window.d20.Campaign.initiativewindow.cleanList();
}

R20.setInitiativeData = function(data) {
    window.d20.Campaign.initiativewindow.model.save({
        turnorder: JSON.stringify(data)
    });
}

R20.getCurrentPage = function () {
    return window.d20.Campaign.activePage();
}

R20.getCurrentPageTokens = function () {
    return window.d20.engine.canvas.getObjects();
}

R20.doesTokenContainMouse = function (mouseEvent, token) {
    return window.d20.engine.canvas.containsPoint(mouseEvent, token);
}

R20.getCurrentPageTokenByUUID = function (uuid) {
    const tokens = R20.getCurrentPageTokens();
    for (let obj of tokens) {
        if (!obj.model) continue;

        if (obj.model.get("id") === uuid) {
            return obj;
        }
    }
    return null;
}

R20.moveCameraToTokenByUUID = function (uuid) {
    if(!uuid) return;
    
    const data = R20.getCurrentPageTokenByUUID(uuid);
    if (!data) return;

    var editor = $("#editor-wrapper")[0];

    editor.scrollTop = Math.floor(data.top * window.d20.engine.canvasZoom) - Math.floor(window.d20.engine.canvasHeight / 2) + 125 * window.d20.engine.canvasZoom;
    editor.scrollLeft = Math.floor(data.left * window.d20.engine.canvasZoom) - Math.floor(window.d20.engine.canvasWidth / 2) + 125 * window.d20.engine.canvasZoom;
}


R20.say = function (what, callback) {

    if(callback) {

        const callbackId = generateUUID();
        $(document).on(`mancerroll:${callbackId}`, (event, rollData) => {
            $(document).off(`mancerroll:${callbackId}`);
            callback(event, rollData);
        });

        window.d20.textchat.doChatInput(what, callbackId);
        
    } else {
        window.d20.textchat.doChatInput(what);
    }
}

R20.sayToSelf = function(what, callbackId) {
    R20.say(`/w "${R20.getCurrentPlayer().get("displayname")}" ${what}`, callbackId);
    // TODO : try out d20.textchat.incoming
}

R20.ping = function(left, top, playerId, pageId, layer) {
    playerId = playerId || R20.getCurrentPlayer().id;

    d20.engine.pings[playerId] = {
        left: left,
        top: top,
        radius: -5,
        player: playerId,
        pageid: pageId || R20.getCurrentPage().id,
        currentLayer: layer || R20.getCurrentLayer()
    };

    d20.engine.pinging = {
        downx: left,
        downy: top,
    };

    d20.engine.renderTop();
}

R20.renderAll = function() {
    window.d20.engine.renderAll();
}

R20.layer = {
    map: "map",
    playerTokens: "objects",
    gmTokens: "gmlayer"
}

R20.initiativeOrdering = {
    numericAscending: 0,
    numericDescending: 1,
    alphabetical: 2,
    alphabeticalDescending: 3,
    card: 4,
}

export { R20 }
