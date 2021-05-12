declare namespace Roll20 {


    export function generateUUID(): string;

    export interface JukeboxFileStructure {
        id: string;
        // name
        n: string;
        // no clue
        s: string;
        // song ids
        i: string[];
    }

    export interface JukeboxSongAttributes {
        id: string;
        loop: boolean;
        playing: boolean;
        softstop: boolean;
        source: string;
        tags: string;
        title: string;
        track_id: string;
        volume: number;
    }

    export interface JukeboxSong extends SyncObject<JukeboxSongAttributes> {

    }

    export interface SyncObject<TAttribs> {
        save: (data?: TAttribs | any, extra?: any) => TAttribs;
        get: <T>(attrib: string) => T;
        destroy: () => void; // actually returns some firebase internal stuff that we dont care about

        id: string;
        cid: string;
        attributes: TAttribs;

        on: (event: string, callback: (e: any) => void) => void;
        off: (event: string, callback: (e: any) => void) => void;

        toJSON: () => TAttribs;
    }

    export interface CharacterBlobs {
        gmnotes?: string;
        defaulttoken?: string;
        bio?: string;
    }

    export interface RollableTableEntryAttributes {
        name: string;
        id: string;
        weight: number;
        avatar: string;
    }

    export interface RollableTableEntry extends SyncObject<RollableTableEntryAttributes> {

    }

    export interface RollableTableAttributes {

    }

    export interface RollableTable extends SyncObject<RollableTableAttributes> {
        tableitems: ObjectStorage<RollableTableEntry>;
    }

    export interface PlayerAttributes {
        macrobar: string;
        displayname: string;
    }

    export interface MacroAttributes {
        action: string;
        id: string;
        istokenaction: boolean;
        name: string;
        visibleto: string;
    }

    export interface Macro extends SyncObject<MacroAttributes> {

    }

    export interface Player extends SyncObject<PlayerAttributes> {
        macros: ObjectStorage<Macro>
    }

    export interface HandoutAttributes {
        archived: boolean;
        avatar: string;
        controlledby: string;
        gmnotes: number;
        id: string;
        inplayerjournals: string;
        name: string;
        notes: number;
        tags: string;
    }

    export interface HandoutBlobs {
        notes?: string;
        gmnotes?: string;
    }

    export interface Handout extends SyncObject<HandoutAttributes>, IBlobObject<HandoutBlobs> {
        collection: ObjectStorage<Handout>;
        editview: HandoutEditor;
    }

    export interface IEditorDialog {
        el: HTMLElement;
        render: () => void;
    }

    export interface HandoutEditor extends IEditorDialog {

    }

    export interface CharacterAttributes {
        name: string;
        avatar: string;
        tags: string;
        controlledby: string;
        inplayerjournals: string;
        defaulttoken: number | string; // string if null, and the number value is a unix timestamp
        id: string;
        bio: string|number; // string if null, and the number value is a unix timestamp
        gmnotes: string|number; // string if null, and the number value is a unix timestamp
        archived: boolean;
        attrorder: string;
        abilorder: string;
        mancerdata?: string;
        mancerget?: string;
        mancerstep?: string;
    }

    export interface CharacterSheetAttributeAttributes {
        name: string;
        current: string;
        max: string;
    }

    export interface CharacterSheetAttribute extends SyncObject<CharacterSheetAttributeAttributes>{

    }

    export interface CharacterAbilityAttributes {

    }

    export interface CharacterAbility extends SyncObject<CharacterAbilityAttributes> {

    }

    export interface IBlobObject<TBlobs> {
        _blobcache: CharacterBlobs;
        updateBlobs: (blobs: TBlobs) => void;
        _getLatestBlob: (blobName: string, callback: (blob: string) => void) => void;
    }

    export interface Character extends SyncObject<CharacterAttributes>, IBlobObject<CharacterBlobs> {
        attribs: ObjectStorage<CharacterSheetAttribute>;
        abilities: ObjectStorage<CharacterAbility>;
        view: CharacterView;
        editview: CharacterEditor;

        /*
            Orders repeating action IDs in a deterministic order.
            This is used to map an index to an action:

            For example, if we want to figure out which action this refers to:
            %{selected|repeating_npcaction_$1_npc_action}
            We would have to create an array of repeating actions ids 
            that are under the npcaction group. We can do this by iterating
            over attributes and parsing their names in the following format:

            repeating_$group_$id_$attribute
            eg: repeating_npcaction_-LLCIa-7pxyiqEzjOu2-_name"

            Then we would call repeatingKeyOrder to sort this table, passing it
            the repeating action id array as repeatingIds and the $group as groupName.

            The value located at index 1 of the returned array would be what we 
            were locking for.
        */
        repeatingKeyOrder: (repeatingIds: string[], groupName: string) => string[];

    }

    export interface CharacterView {
        render: () => void;
        $el: any;
        showDialog: () => void;
        changedByMe: string | boolean;
    }

    export interface CampaignAttributes {
        turnorder: string;
        playerpageid: string;
        jukeboxfolder: string;
        initiativepage: boolean; // show initiative
        bar1_color: string;
        bar2_color: string;
        bar3_color: string;
    }

    export interface Campaign extends SyncObject<CampaignAttributes> {
        handouts: ObjectStorage<Handout>;
        characters: ObjectStorage<Character>;
        rollabletables: ObjectStorage<RollableTable>;
        initiativewindow: InitiativeTracker;
        pages: ObjectStorageWithBackbone<Page>;

        activePage: () => Page;
    }

    export interface MapTokenAttributes {
        page_id: string;
        controlledby: string;
    }

    export interface PageAttributes {

        adv_fow_dim_reveals: boolean
        adv_fow_enabled: boolean
        adv_fow_grid_size: number
        adv_fow_show_grid: boolean
        archived: boolean
        background_color: string;
        diagonaltype: string;
        fog_opacity: number;
        grid_opacity:number;
        grid_type: string;
        gridcolor: string;
        gridlabels: boolean;
        height: number;
        jukeboxtrigger: string;
        lightenforcelos: boolean;
        lightglobalillum: boolean;
        lightrestrictmove: boolean;
        lightupdatedrop: boolean;
        name: string;
        placement: number;
        revealedAreas: string;
        scale_number: number;
        scale_units: string;
        showdarkness: boolean;
        showgrid: boolean;
        showlighting: boolean;
        snapping_increment: number;
        thumbnail: string;
        version: number;
        width: number;
        zorder: string[]; // comma separated list of token ids
    }

    export interface Page extends SyncObject<PageAttributes> {
        thepaths: ObjectStorageWithBackbone<PathToken> | null;
        thegraphics: ObjectStorageWithBackbone<Token> | null;
        thetexts: ObjectStorageWithBackbone<TextToken> | null;
        addImage: (token: object, force_snap?: boolean, unused_1?: boolean, unused_2?: boolean, unused_3?: boolean, addToFrontAndFireModifier?: boolean) => Token;
    }

    export interface BackboneFirebase {
        reference: Firebase
    }

    export type FirebaseEventTypes = "value" | "child_added" | "child_removed" | "child_changed" | "child_moved";

    export interface FirebaseReference<T> {
        val: () => T;
        key: () => string;
    }

    export interface Firebase {
        // https://www.firebase.com/docs/web/api/query/on.html
        on: (event: FirebaseEventTypes, callback: Function) => void;

        // https://www.firebase.com/docs/web/api/query/off.html
        off: (event?: FirebaseEventTypes, callback?: Function) => void;
    }

    export interface TextTokenAttributes extends MapTokenAttributes {}
    export interface TextToken extends SyncObject<TextTokenAttributes> { }

    export interface PathTokenAttributes extends MapTokenAttributes {
        controlledby: string;
        fill:  string; // transparent
        groupwith: string;
        height: number;
        id: string;
        layer: string;
        path: string;
        rotation: number;
        scaleX: number;
        scaleY: number;
        stroke: string;
        stroke_width: number;
        top: number;
        type: string; // path
        width: number;
        left: number;
        z_index: number;
    }
    type TokenViewPermissions = "hidden" | "editors" | "everyone";

    export interface TokenAttributes extends MapTokenAttributes{
        night_vision_effect: string | null
        night_vision_distance: number
        vttes_dimming_start: number

        adv_fow_view_distance: string;
        statusmarkers: string;
        statusdead: boolean;
        sides: number;
        pageid: string;
        locked: boolean;
        isdrawing: boolean;
        groupwidth: number;
        currentSide: number;
        cardid: string;
        anim_autoplay: boolean
        anim_loop: boolean
        anim_paused_at: number;
        aura1_color: string;
        aura1_radius: string;
        aura1_square: boolean;
        aura2_color: string;
        aura2_radius: string;
        aura2_square: boolean;
        bar1_link: string;
        bar1_max: number;
        bar1_value: number;
        bar2_link: string;
        bar2_max: number;
        bar2_value: number;
        bar3_link: string;
        bar3_max: number;
        bar3_value: number;
        gmnotes: string;
        height: number;
        imgsrc: string;
        lastmove: string;
        layer: string;
        left: number;
        light_dimradius: string;
        light_hassight: boolean;
        light_losangle: string;
        light_radius: string;
        light_angle: string;
        light_otherplayers: boolean;
        light_multiplier: string;
        name: string;
        page_id: string;
        represents: string;
        rotation: number;
        showname: boolean;
        showplayers_aura1: boolean;
        showplayers_aura2: boolean;
        showplayers_bar1: boolean;
        showplayers_bar2: boolean;
        showplayers_bar3: boolean;
        showplayers_name: boolean;
        playersedit_aura1: boolean;
        playersedit_aura2: boolean;
        playersedit_bar1: boolean;
        playersedit_bar2: boolean;
        playersedit_bar3: boolean;
        playersedit_name: boolean;
        tint_color: string;
        bar1_num_permission : TokenViewPermissions;
        bar2_num_permission : TokenViewPermissions;
        bar3_num_permission : TokenViewPermissions;
        bar_location: "above" | "overlap_top" | "overlap_bottom" | "below"
        top: number;
        width: number;
        z_index: number;
        type: string;
    }

    export interface Token extends SyncObject<TokenAttributes> {
        character?: Character;

    }

    export interface PathToken extends SyncObject<PathTokenAttributes> {

    }

    export interface FrameRecorder {
        clear : () => void;
        shutdown : () => void;
        startup: () => void;
    }

    export interface CanvasObject {
        _element: HTMLImageElement;
        // try_get_canvas_object_model
        top: number;
        left: number;
        angle: number;
        flipX: boolean;
        flipY: boolean;

        _nameplate_data: {
            font_size: number,
            name: string,
            padding: number,
            position: number[],
            size: number[],
            vertical_offset: number
        }

        _bar_data: {
            border_size: number;
            font: string;
            height: number;
            horizontal_margin: number;
            position: number[];
            stroke: string;
            text_fill: string;
            text_padding: number;
            text_stroke: string;
            text_stroke_size: number;
            to_render: [];
            vertical_padding: number;
            width: number;
        }

        setWidth(width: number): CanvasObject;
        setHeight(width: number): CanvasObject;
        get: <T>(attrib: string) => T;

        width: number;
        height: number;
    }

    export interface PlayerSettings {
        refreshMacroBar: () => void;
        refreshRollsList: () => void;
    }

    export interface InitiativeData {
        _pageid: string;
        custom: string;
        id: string;
        pr: number; // initiative score
        formula?: string;
    }

    export interface InitiativeTracker {
        nextTurn: () => void;
        addTokenToList: (uuid: string, name?: string, formula?: string) => void;
        cleanList: () => InitiativeData[];
        model: Campaign;
    }

    export interface Chat {
        doChatInput: (message: string, /* unknown */ type?: string, callbackUUID?: string) => void;
        incoming: (playSound: boolean, data: any) => void;
    }

    interface InlineRollResults {
        total: number;
    }

    interface InlineRoll {
        results: InlineRollResults;
    }
    export interface RollCallbackData {
        // todo
        inlinerolls: InlineRoll[];
    }

    export interface PingData {
        left: number;
        top: number;
        radius: number;
        player: string; // id
        pageid: string;
        currentLayer: string;
    }

    export interface LocalPingData {
        downx: number; // left
        downy: number; // top
    }

    export interface Engine {
        frame_recorder : FrameRecorder
        gm_layer_opacity: number;
        selected: () => CanvasObject[];
        unselect: () => void;
        select: (obj: CanvasObject) => void;

        redrawScreenNextTick: (flags: boolean) => void;

        pings: { [uuid: string]: PingData };
        pinging: LocalPingData;

        mousePos: number[];
        mode: string;
        canvas: Canvas;
        canvasZoom: number;
        canvasHeight: number;
        canvasWidth: number;
        backgroundColor: string;

        currentCanvasOffset: number[];

        setCanvasSize: (width: number, height: number) => void;
        setZoom: (coef: number, b: any, c: any) => void;
    }

    export interface TokenEditor {
        removeRadialMenu: () => void;
        closeContextMenu: () => void;
    }

    export interface CharacterEditor extends IEditorDialog {
        model: Character;
        collection: ObjectStorage<Character>
    }
    export interface Canvas {
        getObjects: () => CanvasObject[];
        containsPoint: (e: MouseEvent, obj: CanvasObject) => boolean;
        width: number;
        height: number;
    }

    export interface Utils {
        setupAvatar: (element: JQuery<any>, parentObject: any) => void;
    }

    export interface Canvas_Overlay {
        drawBackground: (e: CanvasRenderingContext2D, t: any) => void;
    }

    export interface D20 {
        canvas_overlay: Canvas_Overlay;
        Campaign: Campaign;
        engine: Engine;
        token_editor: TokenEditor;
        textchat: Chat;
        player_settings: PlayerSettings;
        utils: Utils;
        jukebox: D20Jukebox;
        journal: D20Journal;
    }

    export interface D20Journal {
        customSheets: {
            workerScripts: string[];
        }
    }

    export interface D20Jukebox {
        lastFolderStructure: JukeboxFileStructure[];
        addItemToFolderStructure: (songId: string, folderId: string) => void;
        addFolderToFolderStructure: (name: string) => string;
    }

    export interface GlobalJukebox {
        playlist: ObjectStorage<JukeboxSong>;
        soundObjs: {[id: string]: any}
    }

    export interface ObjectStorageWithBackbone<T> extends ObjectStorage<T> {
        backboneFirebase: BackboneFirebase;
    }

    export interface ObjectStorage<T> {
        length: number;
        models: T[];
        get: (uuid: string) => T;
        getByCid: (cid: string) => T;
        create: (initialState?: T | any) => T;
        find: (predicate: (element: T) => boolean) => T;
        map: <TOut>(selector: (element: T) => TOut)=> TOut[];

        backboneFirebase: BackboneFirebase;
        //reset: () => ObjectStorage<T>; local only, doesn't sync with firebase
    }

    export interface R20ESKeys  {
        altDown: boolean
        shiftDown: boolean
        ctrlDown: boolean
        metaDown: boolean
    }

    export interface R20ES {
      syncConfigs: () => void;
        is_drawing_bars_at_the_bottom: boolean;
        prepNameplateBack: Function;
        prepNameplateText: Function;
        togglePageToolbar: () => void;
        tokenDrawBg: (ctx: CanvasRenderingContext2D, graphic: CanvasObject) => void;
        pingInitiativeToken: (token: Token) => void;
        setModePrologue: (mode: string) => void;
        selectInitiativeToken: (token: Token) => void;
        keys: R20ESKeys;
        replaceIdOnDupe: (original: CharacterEditor, clone: Character) => void;
        onJournalDuplicate: (id: string) => void;
        moveCameraTo: (tokenId: string) => void;
        hooks: {[id: string]: any};
        shouldDoCustomAnim: (key: string) => boolean;
        onPageChange: {on: (fx: Function) => void, off: (fx: Function) => void};
        isWindowLoaded: boolean;
        onResizeCanvas: (width: number, height: number) => void;
        onZoomChange: (zoomCoef: number) => void;
        isLoading: boolean;
        onAppLoad: {
            addEventListener: (ev: Function) => void;
            removeEventListener: (ev: Function) => void;
        }
    }

    export interface Mousetrap {
        bind: (keys: string, cb: () => void) => void;
        unbind: (keys: string) => void;
    }


    export interface SoundManager {
        createSound: (sound: {id: string, url: string}) => any;
    }
}


interface Window {
    Jukebox: Roll20.GlobalJukebox;
    Campaign: Roll20.Campaign;
    d20: Roll20.D20;
    currentPlayer: Roll20.Player;
    is_gm: boolean;
    currentEditingLayer: string;
    generateUUID: () => string;
    r20es: Roll20.R20ES;
    Mousetrap: Roll20.Mousetrap;
    soundManager: Roll20.SoundManager;
}

declare module 'roll20' {
    export = Roll20;
}

