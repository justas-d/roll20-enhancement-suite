/// <reference path="../../typings/roll20/index.d.ts"/>

namespace R20 {

    export enum InitiativeOrdering {
        NumericAscending = 0,
        NumericDescending = 1,
        Alphabetical = 2,
        AlphabeticalDescending = 3,
        Card = 4,
    }
    
    export enum CanvasLayer {
        Map = "map",
        PlayerTokens = "objects",
        GMTokens = "gmlayer",
        Lighting = "walls",
    }
    
    export function getHandout(uuid: string) {
        return window.Campaign.handouts.get(uuid);
    }

    export function createCharacter(initialAttributes) {
        return window.Campaign.characters.create(initialAttributes);
    }

    export function getCharacter(uuid) {
        return window.Campaign.characters.get(uuid);
    }

    export function createRollableTable(initialAttributes) {
        return window.d20.Campaign.rollabletables.create(initialAttributes); 
    }

    export function getRollableTable(uuid) {
        return window.d20.Campaign.rollabletables.get(uuid);
    }

    export function getSelectedTokens() {
        return window.d20.engine.selected();
    }

    export function unselectTokens() {
        return window.d20.engine.unselect();
    }

    export function addTokenToSelection(token) {
        window.d20.engine.select(token);
    }

    export function selectToken(token) {
        unselectTokens();
        addTokenToSelection(token);
    }

    export function hideTokenRadialMenu() {
        window.d20.token_editor.removeRadialMenu();
    }

    export function hideTokenContextMenu() {
        window.d20.token_editor.closeContextMenu();
    }

    export function getCurrentPlayer() {
        return window.currentPlayer;
    }

    export function isGM() {
        return window.is_gm;
    }

    export function getCurrentLayer() {
        return window.currentEditingLayer;
    }

    export function getCurrentToolName() {
        return window.d20.engine.mode;
    }

    export function advanceInitiative() {
        window.d20.Campaign.initiativewindow.nextTurn();
    }

    export function addTokenToInitiative(tokenUUID) {
        window.d20.Campaign.initiativewindow.addTokenToList(tokenUUID);
    }

    export function addCustomItemToInitiative(name, formula) {
        window.d20.Campaign.initiativewindow.addTokenToList("-1", name, formula);
    }

    export function rerenderMacroBar() {
        window.d20.player_settings.refreshMacroBar();
    }

    export function rerenderJournalMacros() {
        window.d20.player_settings.refreshRollsList();
    }

    
    export function orderInitiativeBy(order: InitiativeOrdering) {
        
        const map = {
            [InitiativeOrdering.NumericAscending]: ".sortlist_numeric",
            [InitiativeOrdering.NumericDescending]: ".sortlist_numericdesc",
            [InitiativeOrdering.Alphabetical]: ".sortlist_alpha",
            [InitiativeOrdering.AlphabeticalDescending]: ".sortlist_alphadesc",
            [InitiativeOrdering.Card]: ".sortlist_card"
        };

        if (!(order in map)) {
            console.error(`Invalid initiative ordering: ${order}`);
            return;
        }

        const selector = map[order];

        // the buttons that we click have inline logic to close 
        // this dialog. jquery throws an error when a we try to close 
        // a dialog dialog that is not open.
        // so opening this dialog prevents errors.
        (<any>$("#initiativewindow_settings")).dialog({
            modal: false,
            title: "Turn Order Settings",
            beforeClose: () => { }
        });

        $(selector).click();
    }

    export function getInitiativeWindow() {
        return window.d20.Campaign.initiativewindow;
    }

    export function getInitiativeData() {
        return window.d20.Campaign.initiativewindow.cleanList();
    }

    export function setInitiativeData(data: Roll20.InitiativeData[]) {
        window.d20.Campaign.initiativewindow.model.save({
            turnorder: JSON.stringify(data)
        });
    }

    export function getCurrentPage() {
        return window.d20.Campaign.activePage();
    }

    export function getCurrentPageTokens() {
        return window.d20.engine.canvas.getObjects();
    }

    export function doesTokenContainMouse(mouseEvent: MouseEvent, token: Roll20.CanvasObject) {
        return window.d20.engine.canvas.containsPoint(mouseEvent, token);
    }

    export function getCurrentPageTokenByUUID(uuid: string) {
        const tokens = getCurrentPageTokens();
        for (let obj of tokens) {
            if (!obj.model) continue;

            if (obj.model.get("id") === uuid) {
                return obj;
            }
        }
        return null;
    }

    export function moveCameraToTokenByUUID(uuid: string) {
        if (!uuid) return;

        const data = getCurrentPageTokenByUUID(uuid);
        if (!data) return;

        var editor = $("#editor-wrapper")[0];

        editor.scrollTop = Math.floor(data.top * window.d20.engine.canvasZoom) - Math.floor(window.d20.engine.canvasHeight / 2) + 125 * window.d20.engine.canvasZoom;
        editor.scrollLeft = Math.floor(data.left * window.d20.engine.canvasZoom) - Math.floor(window.d20.engine.canvasWidth / 2) + 125 * window.d20.engine.canvasZoom;
    }

    export function primitiveSay(what: string, callbackId?: string) {
        window.d20.textchat.doChatInput(what, callbackId);
    }

    export function say(what: string, callback?: (e: JQuery.Event<Document, null>, data: Roll20.RollCallbackData) => void) {
        if (callback) {

            const callbackId = window.generateUUID();
            $(document).on(`mancerroll:${callbackId}`, (event, rollData) => {
                $(document).off(`mancerroll:${callbackId}`);
                callback(event, rollData);
            });

            window.d20.textchat.doChatInput(what, callbackId);

        } else {
            window.d20.textchat.doChatInput(what);
        }

    }

    export function sayToSelf(what: string, callbackId: string) {
        primitiveSay(`/w "${getCurrentPlayer().get("displayname")}" ${what}`, callbackId);
        // TODO : try out d20.textchat.incoming
    }

    export function ping(left: number, top: number, playerId?: string, pageId?: string, layer?: CanvasLayer) {
        playerId = playerId || getCurrentPlayer().id;

        window.d20.engine.pings[playerId] = {
            left: left,
            top: top,
            radius: -5,
            player: playerId,
            pageid: pageId || getCurrentPage().id,
            currentLayer: layer || getCurrentLayer()
        };

        window.d20.engine.pinging = {
            downx: left,
            downy: top,
        };

        window.d20.engine.renderTop();
    }

    export function renderAll() {
        window.d20.engine.renderAll();
    }
}

export { R20 }
