import {IApplyableSong} from "./JukeboxIO";
import {EventSubscriber} from "./EventSubscriber";
import {Optional} from "./TypescriptUtils";

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
        B20Foreground = "foreground",
        B20Weather = "weather",
        B20Background = "background"
    }

    export function getBackgroundStyle() {
        return window.d20.engine.backgroundColor;
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

    export const getCanvasMousePos = (): number[] => {
        return [...window.d20.engine.mousePos];
    };

    export function onInitiativeChange(callback: any): EventSubscriber {
        const getter = () => R20.getInitiativeWindow().model;
        return new EventSubscriber("change:turnorder", callback, getter);
    }

    export function setCanvasObjectLocation(obj: Roll20.CanvasObject, left: number, top: number) {
        const model = try_get_canvas_object_model(obj);
        if(!model) {
            return;
        }

        model.save({
            top: top,
            left: left,
        });
    }

    export const getBlob = (obj: Roll20.IBlobObject<any>, blobName: string, timeout: number = 5000) => new Promise<string>((ok, err) => {
        obj._getLatestBlob(blobName, ok);
        setTimeout(err, timeout);
    });

    export function getCampaign(): Roll20.Campaign {
        return window.Campaign;
    }

    export const canEditCharacter = (char: Roll20.Character): boolean => {
        const controlledby = char.attributes.controlledby;

        if(R20.isGM()) return true;
        if(controlledby.includes("all")) return true;
        if(controlledby.includes(R20.getCurrentPlayer().id)) return true;

        return false;
    };

    export function getHandout(uuid: string): Roll20.Handout {
        return window.Campaign.handouts.get(uuid);
    }

    export function createCharacter(initialAttributes?: Roll20.PlayerAttributes): Roll20.Character {
        return window.Campaign.characters.create(initialAttributes);
    }

    export function create_handout(initialAttributes?: Roll20.HandoutAttributes): Roll20.Handout {
      return window.Campaign.handouts.create(initialAttributes);
    }

    export function setCanvasObjectDimensions(obj: Roll20.CanvasObject, width: number, height: number) {
        const model = try_get_canvas_object_model(obj);
        if(!model) return;

        model.save({
            width,
            height
        });
    }

    export function getCharacter(uuid): Roll20.Character {
        return window.Campaign.characters.get(uuid);
    }

    export function getAllCharacters(): Roll20.Character[] {
        return window.Campaign.characters.models;
    }

    export function rerender_character_sheet(sheet: Roll20.Character) {
      try {
        sheet.view.$el.dialog("close");
        setTimeout(() => {
          sheet.view.showDialog();
        }, 500);
      } catch(e) {
        console.log(e);
      }
    }

    export function getAllPages(): Roll20.Page[] {
        return window.Campaign.pages.models;
    }

    export function createRollableTable(initialAttributes?: any): Roll20.RollableTable {
        return window.d20.Campaign.rollabletables.create(initialAttributes);
    }

    export function getRollableTable(uuid): Roll20.RollableTable {
        return window.d20.Campaign.rollabletables.get(uuid);
    }

    export function getSelectedTokens(): Roll20.CanvasObject[] {
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

    export const set_zoom = (zoom: number) => {
      if(zoom > 2.5) zoom = 2.5;
      if(.1 > zoom) zoom = .1;

      window.d20.engine.setZoom(zoom);
    }
    
    export const getCanvasZoom = (): number => {
        return window.d20.engine.canvasZoom;
    };

    export const getCanvasWidth = (): number => {
        return window.d20.engine.canvas.width;
    };

    export const getCanvasHeight = (): number => {
        return window.d20.engine.canvas.height;
    };

    export const getCanvasOffsetX= (): number => {
        return window.d20.engine.currentCanvasOffset[0];
    };

    export const getCanvasOffsetY= (): number => {
        return window.d20.engine.currentCanvasOffset[1];
    };

    export const getPageById = (id: string): Optional<Roll20.Page> => {
        return window.Campaign.pages.get(id);
    };

    export function isGM(): boolean {
        return window.is_gm;
    }

    export function getCurrentLayer(): CanvasLayer {
        return window.currentEditingLayer as CanvasLayer;
    }

    export const generateUUID = (): string => {
        return window.generateUUID();
    };

    export const generate_repeating_uuid = (): string => {
      return window.generateUUID().replace(/_/g, "Z");
    };

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

    export function getInitiativeWindow(): Roll20.InitiativeTracker {
        return window.d20.Campaign.initiativewindow;
    }

    export interface JukeboxPlaylist {
        id: string;
        name: string;
        mode: string;
        songs: Roll20.JukeboxSong[];
    }

    export type JukeboxFileSystem = (Roll20.JukeboxFileStructure | string)[];

    export function getJukeboxFileStructure(): JukeboxFileSystem {
        //return window.d20.jukebox.lastFolderStructure;
        try {
            const folder = window.d20.Campaign.attributes.jukeboxfolder;
            return JSON.parse(folder || "[]");
        }
        catch(e) {
            console.error("[getJukeboxFileStructure] failed to get fs due to exception", e);
        }

        return []
    }

    export function setJukeboxFileStructure(fs: JukeboxFileSystem){
        R20.getCampaign().save({
            jukeboxfolder: JSON.stringify(fs)
        });
    }

    export const createPlaylist = (name: string): string => {
        return window.d20.jukebox.addFolderToFolderStructure(name);
    };

    export const addTrackToPlaylist = (track_id: string, playlist_id: string) => {
        return window.d20.jukebox.addItemToFolderStructure(track_id, playlist_id);
    };

    export function getSongById(id: string): Roll20.JukeboxSong | null {
        return window.Jukebox.playlist.get(id);
    }

    export function getJukeboxPlaylists(): JukeboxPlaylist[] {
        const fs = getJukeboxFileStructure();
        const retvals: JukeboxPlaylist[] = [];

        for (const fsItem of fs) {

            if (typeof(fsItem) === "string")
                continue;

            const rawPlaylist: Roll20.JukeboxFileStructure = fsItem;

            const playlist: JukeboxPlaylist = {
                id: rawPlaylist.id,
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

    export const playAudio = (id: string, url: string) => {
        window.Jukebox.soundObjs[id] = window.soundManager.createSound({
            id,
            url
        });
    };

    export function createSong(data: any | IApplyableSong | Roll20.JukeboxSongAttributes): Roll20.JukeboxSong {
        return window.Jukebox.playlist.create(data);
    }

    export function makePlaylistStructure(name: string, mode: string, songIds?: string[]): Roll20.JukeboxFileStructure {
        return {
            id: window.generateUUID(),
            n: name,
            s: mode,
            i: songIds || []
        };
    }

    export function getInitiativeData(): Roll20.InitiativeData[] {
        return window.d20.Campaign.initiativewindow.cleanList();
    }

    export function setInitiativeData(data: Roll20.InitiativeData[]) {
        window.d20.Campaign.initiativewindow.model.save({
            turnorder: JSON.stringify(data)
        });
    }

    export function getCurrentPage(): Roll20.Page {
        return window.d20.Campaign.activePage();
    }

    export function getCurrentPageTokens(): Roll20.CanvasObject[] {
        return window.d20.engine.canvas.getObjects();
    }

    export function doesTokenContainMouse(mouseEvent: MouseEvent, token: Roll20.CanvasObject): boolean {
        return window.d20.engine.canvas.containsPoint(mouseEvent, token);
    }

    export function getCurrentPageTokenByUUID(uuid: string): Roll20.CanvasObject {
        const tokens = getCurrentPageTokens();
        for (let obj of tokens) {
            const model = try_get_canvas_object_model(obj);
            if(!model) {
                continue;
            }

            if (model.get("id") === uuid) {
                return obj;
            }
        }
        return null;
    }

    export const try_get_canvas_object_model = (obj: Roll20.CanvasObject): Roll20.Token => {
        if(obj["_model"]) return obj["_model"];
        if(obj["model"]) return obj["model"];
        return null;
    };

    export function isUsing5EOGLSheet() {
        try {
            return window.d20.journal.customSheets.workerScripts[0].includes("5th Edition OGL by Roll20");
        } catch (err) {
            return false;
        }
    }

    export const enter_measure_mode = () => {
      $("#measure").trigger("click");
    };

    export const get_camera_x = () => {
      return $("#editor-wrapper").scrollLeft();
    }

    export const get_camera_y = () => {
      return $("#editor-wrapper").scrollTop();
    }

    export const set_camera_x = (x: number) =>  {
      return $("#editor-wrapper").scrollLeft(x);
    }

    export const set_camera_y = (y: number) => {
      return $("#editor-wrapper").scrollTop(y);
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
        callbackId?: string,
        callback?: SayCallback) {
        if (callback) {
            $(document).on(`mancerroll:${callbackId}`, (event, rollData) => {
                $(document).off(`mancerroll:${callbackId}`);
                callback(event, rollData);
            });

            window.d20.textchat.doChatInput(what, "chatbox", callbackId);

        } else {
            window.d20.textchat.doChatInput(what);
        }
    }

    export function say_async(
      what: string
    ) {
      return new Promise((ok, err) => {
        const callback_id = R20.generateUUID();

        $(document).on(`mancerroll:${callback_id}`, (event, roll_data) => {
          $(document).off(`mancerroll:${callback_id}`);

          ok({event, roll_data});
        });

        window.d20.textchat.doChatInput(what, "chatbox", callback_id);
      });
    }

    export function sayToSelf(
        what: string,
        callback?: (e: JQuery.Event<Document, null>, data: Roll20.RollCallbackData)
            => void) {

        const msg = `/w "${getCurrentPlayer().get("displayname")}" ${what}`;
        if(callback) {
            say(msg, R20.generateUUID(), callback);
        } else {
            say(msg);
        }
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
    box-shadow: 0px 0px 10px rgb(6, 26, 45);
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

        renderAll();
    }

    export const getFabric = (): any => {
        return window["exports"].fabric;
    };

    export function renderAll() {
        window.d20.engine.redrawScreenNextTick(false);
    }

    export const setGMLayerOpacity = (opacity_t: number) => {
        window.d20.engine.gm_layer_opacity = opacity_t;
    };



    export const hasBetteR20 = (): boolean => {
        return window["d20plus"] !== undefined;
    };

    export const set_drawing_brush_size = (size: number) => {
      window.d20.engine.canvas.freeDrawingBrush.width = size;
    }

    export const ensure_character_attributes_are_loaded = async (character: Roll20.Character) => {
      if(character.attribs.backboneFirebase) {
        return;
      }
  
      // @ts-ignore
      character.attribs.backboneFirebase = new BackboneFirebase(character.attribs);

      await character.attribs.backboneFirebase.reference.once("value");
    }

    export const wipeObjectStorage = <T>(storage: Roll20.ObjectStorage<Roll20.SyncObject<T>>): void => {

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
    };

    /*
    export const on_select_shape_add_event_listener = (callback: (e: any, shape: Roll20.CanvasObject) => void) => {
        $("body").on("shape_selected", "#editor", callback);
    };

    export const on_select_shape_remove_event_listener = (callback: (e: any, shape: Roll20.CanvasObject) => void) => {
        $("body").off("shape_selected", "#editor", callback);
    };
    */
}

export {R20}
