/// <reference path="../../typings/roll20/index.d.ts"/>

import {
    Campaign,
    CanvasObject,
    Character,
    Handout,
    IBlobObject,
    InitiativeData,
    InitiativeTracker,
    JukeboxFileStructure,
    JukeboxSong,
    ObjectStorage,
    Page,
    PlayerAttributes,
    RollableTable,
    SyncObject,
    JukeboxSongAttributes
} from "roll20";
import {IApplyableSong} from "./JukeboxIO";
import {EventSubscriber} from "./EventSubscriber";

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

    export function setBackgroundStyle(bgStyle: string) {
        window.d20.engine.backgroundColor = bgStyle;
    }

    export function setupImageDropTarget(element: JQuery<any>,
                                         saveCallback: ({avatar}: { avatar: string }) => void,
                                         updateModelCallback: () => void) {

        const r20AvatarContext: any = {
            model: {
                save: saveCallback
            },
            updateModel: updateModelCallback
        };

        window.d20.utils.setupAvatar(element, r20AvatarContext);
    }

    export function onInitiativeChange(callback: any): EventSubscriber {
        const getter = () => R20.getInitiativeWindow().model;
        return new EventSubscriber("change:turnorder", callback, getter);
    }

    export function setCanvasObjectLocation(obj: CanvasObject, left: number, top: number) {
        obj.model.save({
            top: top,
            left: left,
        });
    }

    export const getBlob = (obj: IBlobObject<any>, blobName: string, timeout: number = 5000) => new Promise<string>((ok, err) => {
        obj._getLatestBlob(blobName, ok);
        setTimeout(err, timeout);
    });

    export function getCampaign(): Campaign {
        return window.Campaign;
    }

    export function getHandout(uuid: string): Handout {
        return window.Campaign.handouts.get(uuid);
    }

    export function createCharacter(initialAttributes?: PlayerAttributes): Character {
        return window.Campaign.characters.create(initialAttributes);
    }

    export function setCanvasObjectDimensions(obj: CanvasObject, width: number, height: number) {
        obj.model.save({
            width,
            height
        });
    }

    export function getCharacter(uuid): Character {
        return window.Campaign.characters.get(uuid);
    }

    export function getAllCharacters(): Character[] {
        return window.Campaign.characters.models;
    }

    export function getAllPages(): Page[] {
        return window.Campaign.pages.models;
    }

    export function createRollableTable(initialAttributes): RollableTable {
        return window.d20.Campaign.rollabletables.create(initialAttributes);
    }

    export function getRollableTable(uuid): RollableTable {
        return window.d20.Campaign.rollabletables.get(uuid);
    }

    export function getSelectedTokens(): CanvasObject[] {
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

    export function getCurrentPlayer(): Roll20.Player {
        return window.currentPlayer;
    }

    export function isGM(): boolean {
        return window.is_gm;
    }

    export function getCurrentLayer(): CanvasLayer {
        return window.currentEditingLayer;
    }

    export function getCurrentToolName(): string {
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
            beforeClose: () => {
            }
        });

        $(selector).click();
    }

    export function getInitiativeWindow(): InitiativeTracker {
        return window.d20.Campaign.initiativewindow;
    }

    export interface JukeboxPlaylist {
        name: string;
        mode: string;
        songs: JukeboxSong[];
    }

    export function getJukeboxFileStructure(): (JukeboxFileStructure | string)[] {
        return window.d20.jukebox.lastFolderStructure;
    }

    export function getSongById(id: string): JukeboxSong | null {
        return window.Jukebox.playlist.get(id);
    }

    export function getJukeboxPlaylists(): JukeboxPlaylist[] {
        const fs = getJukeboxFileStructure();
        const retvals: JukeboxPlaylist[] = [];

        for (const fsItem of fs) {

            if (typeof(fsItem) === "string")
                continue;

            const rawPlaylist: JukeboxFileStructure = fsItem;

            const playlist: JukeboxPlaylist = {
                name: rawPlaylist.n,
                mode: rawPlaylist.s,
                songs: [],
            };

            for (const songId of rawPlaylist.i) {

                const song = getSongById(songId);
                if (!song) {
                    console.warn(`Tried to get song id ${songId} but the query returned a falsy value. Skipping`);
                    continue;
                }

                playlist.songs.push(song);
            }

            retvals.push(playlist);
        }

        return retvals;
    }

    export function createSong(data: any | IApplyableSong | JukeboxSongAttributes): JukeboxSong {
        return window.Jukebox.playlist.create(data);
    }

    export function makePlaylistStructure(name: string, mode: string, songIds?: string[]): JukeboxFileStructure {
        return {
            id: window.generateUUID(),
            n: name,
            s: mode,
            i: songIds || []
        };
    }

    export function getInitiativeData(): InitiativeData[] {
        return window.d20.Campaign.initiativewindow.cleanList();
    }

    export function setInitiativeData(data: Roll20.InitiativeData[]) {
        window.d20.Campaign.initiativewindow.model.save({
            turnorder: JSON.stringify(data)
        });
    }

    export function getCurrentPage(): Page {
        return window.d20.Campaign.activePage();
    }

    export function getCurrentPageTokens(): CanvasObject[] {
        return window.d20.engine.canvas.getObjects();
    }

    export function doesTokenContainMouse(mouseEvent: MouseEvent, token: Roll20.CanvasObject): boolean {
        return window.d20.engine.canvas.containsPoint(mouseEvent, token);
    }

    export function getCurrentPageTokenByUUID(uuid: string): CanvasObject {
        const tokens = getCurrentPageTokens();
        for (let obj of tokens) {
            if (!obj.model) continue;

            if (obj.model.get("id") === uuid) {
                return obj;
            }
        }
        return null;
    }

    export function isUsing5EOGLSheet() {
        try {
            return window.d20.journal.customSheets.workerScripts[0].includes("5th Edition OGL by Roll20");
        } catch (err) {
            return false;
        }
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

    export type SayCallback = (e: JQuery.Event<Document, null>, data: Roll20.RollCallbackData) => void;

    export function say(
        what: string,
        callback?: SayCallback) {
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

    export function sayToSelf(
        what: string,
        callback?: (e: JQuery.Event<Document, null>, data: Roll20.RollCallbackData)
            => void) {
        say(`/w "${getCurrentPlayer().get("displayname")}" ${what}`, callback);
    }

    export function saySystemRaw(htmlContent: string) {
        window.d20.textchat.incoming(false, ({
            who: "system",
            type: "system",
            content: htmlContent
        }));
    }

    export function saySystem(content: string) {
        saySystemRaw(`<span style="background: rgba(6,26,45,255);
    color: whitesmoke;
    border: none;
    display: inline-block;
    padding: 8px;
    margin: -15px -5px -7px -45px;    
    "
>
${content}
</span>
        `)
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

    export const wipeObjectStorage = <T>(storage: ObjectStorage<SyncObject<T>>): void => {

        const len = storage.length;
        for (let __unusedIndex = 0; __unusedIndex < len; __unusedIndex++) {
            // Note(Justas): i don't want to control 'i' here. The storage models array needs to directly control this.
            const i = storage.length - 1;
            if (0 > i) break;

            const obj = storage.models[i];
            if (!obj || typeof(obj) === "undefined") break;

            obj.destroy();
        }

        if (storage.length < 0) {
            console.error("FAILED TO WIPE OBJECT STORAGE!");
        }
    }
}

export {R20}
