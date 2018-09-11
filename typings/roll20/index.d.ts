declare enum InitiativeOrdering {
    NumericAscending = 0,
    NumericDescending = 1,
    Alphabetical = 2,
    AlphabeticalDescending = 3,
    Card = 4,
}

declare enum CanvasLayer {
    Map = "map",
    PlayerTokens = "objects",
    GMTokens = "gmlayer",
    Lighting = "walls",
}

declare namespace Roll20 {


    export function generateUUID(): string;

    export interface SyncObject<TAttribs> {
        save: (data?: TAttribs | any) => TAttribs;
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

    export interface RollableTableAttributes {

    }

    export interface RollableTable extends SyncObject<RollableTableAttributes> {
        // todo
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
    }

    export interface CampaignAttributes {
        turnorder: string;
        playerpageid: string;
    }

    export interface Campaign extends SyncObject<CampaignAttributes> {
        handouts: ObjectStorage<Handout>;
        characters: ObjectStorage<Character>;
        rollabletables: ObjectStorage<RollableTable>;
        initiativewindow: InitiativeTracker;
        pages: ObjectStorage<Map>;

        activePage: () => Page;
    }

    export interface MapAttributes {
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

    export interface Map extends SyncObject<MapAttributes> {
        thepaths: ObjectStorage<PathToken>;
        thegraphics: ObjectStorage<Token>;
        thetexts: ObjectStorage<TextToken>;
    }

    export interface TextTokenAttributes {}
    export interface TextToken extends SyncObject<TextTokenAttributes> { }

    export interface PathTokenAttributes {
        controlledby: string;
        fill:  string; // transparent
        groupwith: string;
        height: number;
        id: string;
        layer: string;
        page_id: number;
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

    export interface TokenAttributes {

    }

    export interface Token extends SyncObject<TokenAttributes> {
        character?: Character;
    }

    export interface PathToken extends SyncObject<PathTokenAttributes> {

    }

    export interface CanvasObject extends SyncObject<CanvasObject> {
        model?: Token;
        top: number;
        left: number;
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
        doChatInput: (message: string, callbackUUID?: string) => void;
    }

    export interface RollCallbackData {
        // todo
    }

    export interface PingData {
        left: number;
        top: number;
        radius: number;
        player: string; // id
        pageid: string;
        currentLayer: CanvasLayer;
    }

    export interface LocalPingData {
        downx: number; // left
        downy: number; // top
    }

    export interface Engine {
        selected: () => CanvasObject[];
        unselect: () => void;
        select: (obj: CanvasObject) => void;
        renderAll: () => void;
        renderTop: () => void;

        pings: { [uuid: string]: PingData };
        pinging: LocalPingData;

        mode: string; // current tool name todo
        canvas: Canvas;
        canvasZoom: number;
        canvasHeight: number;
        canvasWidth: number;
    }

    export interface TokenEditor {
        removeRadialMenu: () => void;
        closeContextMenu: () => void;
    }

    export interface CharacterEditor extends IEditorDialog {
        model: Character;
        collection: ObjectStorage<Character>
    }

    export interface PageAttributes {

    }

    export interface Page extends SyncObject<PageAttributes> {

    }

    export interface Canvas {
        macros
        getObjects: () => CanvasObject[];
        containsPoint: (e: MouseEvent, obj: CanvasObject) => boolean;
    }

    export interface D20 {
        Campaign: Campaign;
        engine: Engine;
        token_editor: TokenEditor;
        textchat: Chat;
        player_settings: PlayerSettings;
    }

    export interface ObjectStorage<T> {
        length: number;
        models: T[];
        get: (uuid: string) => T;
        getByCid: (cid: string) => T;
        create: (initialState: T | any) => T;
        find: (predicate: (element: T) => boolean) => T;
        map: <TOut>(selector: (element: T) => TOut)=> TOut[];
        
        //reset: () => ObjectStorage<T>; local only, doesn't sync with firebase
    }

    export interface R20ESKeys  {
        altDown: boolean
        shiftDown: boolean
        ctrlDown: boolean
        metaDown: boolean
    }

    export interface R20ES {
        togglePageToolbar: () => void;
        tokenDrawBg: (ctx: CanvasRenderingContext2D, graphic: CanvasObject) => void;
        pingInitiativeToken: (token: Token) => void;
        setModePrologue: (mode: string) => void;
        selectInitiativeToken: (token: Token) => void;
        keys: R20ESKeys;
        replaceIdOnDupe: (original: CharacterEditor, clone: Character) => void;
        onJournalDuplicate: (id: string) => void;
        moveCameraTo: (tokenId: string) => void;
    }

    export interface Mousetrap {
        bind: (keys: string, cb: () => void) => void;
        unbind: (keys: string) => void;
    }
}


interface Window {
    Campaign: Roll20.Campaign;
    d20: Roll20.D20;
    currentPlayer: Roll20.Player;
    is_gm: boolean;
    currentEditingLayer: CanvasLayer;
    generateUUID: () => string;
    r20es: Roll20.R20ES;
    Mousetrap: Roll20.Mousetrap;
}

declare module 'roll20' {
    export = Roll20;
}

