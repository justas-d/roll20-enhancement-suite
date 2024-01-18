export {}

declare global {

function generateUUID(): string;

namespace Roll20 {
  interface JukeboxFileStructure {
      id: string;
      // name
      n: string;
      // no clue
      s: string;
      // song ids
      i: string[];
  }

  interface JukeboxSongAttributes {
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

  interface JukeboxSong extends SyncObject<JukeboxSongAttributes> {

  }

  interface SyncObject<TAttribs> {
      save: (data?: TAttribs | any, extra?: any) => TAttribs;
      syncedSave: (data? : TAttribs | any) => TAttribs;

      get: <T>(attrib: string) => T;
      destroy: () => void; // actually returns some firebase internal stuff that we dont care about

      id: string;
      cid: string;
      attributes: TAttribs;

      on: (event: string, callback: (e: any) => void) => void;
      off: (event: string, callback: (e: any) => void) => void;

      toJSON: () => TAttribs;
  }

  interface CharacterBlobs {
      gmnotes?: string;
      defaulttoken?: string;
      bio?: string;
  }

  interface RollableTableEntryAttributes {
      name: string;
      id: string;
      weight: number;
      avatar: string;
  }

  interface RollableTableEntry extends SyncObject<RollableTableEntryAttributes> {

  }

  interface RollableTableAttributes {

  }

  interface RollableTable extends SyncObject<RollableTableAttributes> {
      tableitems: ObjectStorage<RollableTableEntry>;
  }

  interface PlayerAttributes {
      macrobar: string;
      displayname: string;
  }

  interface MacroAttributes {
      action: string;
      id: string;
      istokenaction: boolean;
      name: string;
      visibleto: string;
  }

  interface Macro extends SyncObject<MacroAttributes> {

  }

  interface Player extends SyncObject<PlayerAttributes> {
      macros: ObjectStorage<Macro>
  }

  interface HandoutAttributes {
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

  interface HandoutBlobs {
      notes?: string;
      gmnotes?: string;
  }

  interface Handout extends SyncObject<HandoutAttributes>, IBlobObject<HandoutBlobs> {
      collection: ObjectStorage<Handout>;
      editview: HandoutEditor;
  }

  interface IEditorDialog {
      el: HTMLElement;
      render: () => void;
  }

  interface HandoutEditor extends IEditorDialog {

  }

  interface CharacterAttributes {
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

  interface CharacterSheetAttributeAttributes {
    name: string;
    current: string;
    max: string;
    id: string;
  }

  interface CharacterSheetAttribute extends SyncObject<CharacterSheetAttributeAttributes>{
    view: CharacterSheetAttributeView;
  }

  interface CharacterSheetAttributeView {
    rebindEvents: (char: Character) => void;
  }

  interface CharacterAbilityAttributes {
    name: string;
    description: string;
    istokenaction: boolean;
    action: string;
    order: number;
  }

  interface CharacterAbility extends SyncObject<CharacterAbilityAttributes> {

  }

  interface IBlobObject<TBlobs> {
      _blobcache: TBlobs;
      updateBlobs: (blobs: TBlobs) => void;
      _getLatestBlob: (blobName: string, callback: (blob: string) => void) => void;
  }

  interface Character extends SyncObject<CharacterAttributes>, IBlobObject<CharacterBlobs> {
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

  interface CharacterView {
      render: () => void;
      $el: any;
      showDialog: () => void;
      changedByMe: string | boolean;
      saveSheetValues: (a: any, b: any) => void;
      rebindEvents: (char: Character) => void;
  }

  interface CampaignAttributes {
      turnorder: string;
      playerpageid: string;
      jukeboxfolder: string;
      initiativepage: boolean; // show initiative
      bar1_color: string;
      bar2_color: string;
      bar3_color: string;
  }

  interface Campaign extends SyncObject<CampaignAttributes> {
      handouts: ObjectStorage<Handout>;
      characters: ObjectStorage<Character>;
      rollabletables: ObjectStorage<RollableTable>;
      initiativewindow: InitiativeTracker;
      pages: ObjectStorageWithBackbone<Page>;

      activePage: () => Page;
  }

  interface MapTokenAttributes {
      page_id: string;
      controlledby: string;
  }

  interface PageAttributes {

    vttes_default_camera_enabled: boolean;
    vttes_default_camera_x: number;
    vttes_default_camera_y: number;
    vttes_default_camera_zoom: number;

    wrapperColor: string;
    useAutoWrapper: boolean;

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

  interface Page extends SyncObject<PageAttributes> {
    thepaths: ObjectStorageWithBackbone<PathToken> | undefined;
    thegraphics: ObjectStorageWithBackbone<Token> | undefined;
    thetexts: ObjectStorageWithBackbone<TextToken> | undefined;
    addImage: (token: object, force_snap?: boolean, unused_1?: boolean, unused_2?: boolean, unused_3?: boolean, addToFrontAndFireModifier?: boolean) => Token;

    fullyLoadPage: () => void;

    view : Page_View;
  }

  interface Page_View {
    updateWrapperColor: Function;
  }

  interface BackboneFirebase {
      reference: Firebase
  }

  type FirebaseEventTypes = "value" | "child_added" | "child_removed" | "child_changed" | "child_moved";

  interface FirebaseReference<T> {
      val: () => T;
      key: string;
      getPriority: () => number;
  }

  interface Firebase {
      // https://www.firebase.com/docs/web/api/query/on.html
      on: (event: FirebaseEventTypes, callback: Function) => void;

      // https://www.firebase.com/docs/web/api/query/off.html
      off: (event?: FirebaseEventTypes, callback?: Function) => void;

      once: (event?: FirebaseEventTypes, callback?: Function) => Promise<void>;
  }

  interface TextTokenAttributes extends MapTokenAttributes {}
  interface TextToken extends SyncObject<TextTokenAttributes> { }

  interface PathTokenAttributes extends MapTokenAttributes {
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

  interface TokenAttributes extends MapTokenAttributes{
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

  interface Token extends SyncObject<TokenAttributes> {
      character?: Character;

  }

  interface PathToken extends SyncObject<PathTokenAttributes> {

  }

  interface FrameRecorder {
      clear : () => void;
      shutdown : () => void;
      startup: () => void;
  }

  interface CanvasObject {
      _element: HTMLImageElement;
      // try_get_canvas_object_model
      top: number;
      left: number;
      angle: number;
      flipX: boolean;
      flipY: boolean;
      type: "path";

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

  interface PlayerSettings {
      refreshMacroBar: () => void;
      refreshRollsList: () => void;
  }

  interface InitiativeData {
      _pageid: string;
      custom: string;
      id: string;
      pr: number; // initiative score
      formula?: string;
  }

  interface InitiativeTracker {
      nextTurn: () => void;
      addTokenToList: (uuid: string, name?: string, formula?: string) => void;
      cleanList: () => InitiativeData[];
      model: Campaign;
  }

  interface Chat {
      doChatInput: (message: string, /* unknown */ type?: string, callbackUUID?: string) => void;
      incoming: (playSound: boolean, data: any) => void;
  }

  interface ChatMessage {
    avatar: string | null;
    content: string | null;
    playerid: string | null;
    type: "general" | "api" | null;
    who: string | null;

  }

  interface InlineRollResults {
      total: number;
  }

  interface InlineRoll {
      results: InlineRollResults;
  }
  interface RollCallbackData {
      // todo
      inlinerolls: InlineRoll[];
  }

  interface PingData {
      left: number;
      top: number;
      radius: number;
      player: string; // id
      pageid: string;
      currentLayer: string;
  }

  interface LocalPingData {
      downx: number; // left
      downy: number; // top
  }

  interface Engine {
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
      setZoom: (coef: number, b?: any, c?: any) => void;

      final_canvas: HTMLCanvasElement;
  }

  interface TokenEditor {
      removeRadialMenu: () => void;
      closeContextMenu: () => void;
  }

  interface CharacterEditor extends IEditorDialog {
      model: Character;
      collection: ObjectStorage<Character>
  }
  interface Canvas {
    getObjects: () => CanvasObject[];
    containsPoint: (e: MouseEvent, obj: CanvasObject) => boolean;
    width: number;
    height: number;
    freeDrawingBrush: FreeDrawingBrush;
  }

  interface FreeDrawingBrush {
    width: number;
  }

  interface Utils {
      setupAvatar: (element: JQuery<any>, parentObject: any) => void;
  }

  interface Canvas_Overlay {
    drawBackground: (e: CanvasRenderingContext2D, t: any) => void;
    drawGrid: (e: CanvasRenderingContext2D) => void;
  }

  interface D20 {
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

  interface D20Journal {
      customSheets: {
          workerScripts: string[];
      }
  }

  interface D20Jukebox {
      lastFolderStructure: JukeboxFileStructure[];
      addItemToFolderStructure: (songId: string, folderId: string) => void;
      addFolderToFolderStructure: (name: string) => string;
  }

  interface GlobalJukebox {
      playlist: ObjectStorage<JukeboxSong>;
      soundObjs: {[id: string]: any}
  }

  interface ObjectStorageWithBackbone<T> extends ObjectStorage<T> {
    backboneFirebase: BackboneFirebase;
    init_promise: Promise<void>;
  }

  interface ObjectStorage<T> {
    length: number;
    models: T[];
    get: (uuid: string) => T;
    getByCid: (cid: string) => T;
    create: (initialState?: T | any, options?: any) => T;
    find: (predicate: (element: T) => boolean) => T;
    map: <TOut>(selector: (element: T) => TOut)=> TOut[];

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `add` event for every new model.
    add: (obj: T | Array<T>, options?: any) => ObjectStorage<T>;

    // When you have more items than you want to add or remove individually, you can reset the
    // entire set with a new list of models, without firing any `add` or `remove` events. Fires
    // `reset` when finished.  Pass **silent** to avoid firing the `reset` event and other events
    // from the looks of it as it propagates.
    reset: (models: Array<T>, options?: any) => ObjectStorage<T>;

    backboneFirebase: BackboneFirebase;
  }

  interface R20ESKeys  {
    altDown: boolean
    shiftDown: boolean
    ctrlDown: boolean
    metaDown: boolean
  }

  interface R20ES {
    manual_composite: () => void;

    onDocumentMouseUp: (e: any) => void;

    onLoadingOverlayHide: () => void;

    save_configs: () => void;
    render_extra_rulers: Function;
    extra_ruler_set_mode: Function;

    extra_ruler: {
      radius_mode: number;
      box_mode: number;
      cone_mode: number;
      cone_degrees: number;
      line_mode: number;
      line_width: number;
      ruler_mode: number;
    };

    is_drawing_bars_at_the_bottom: boolean;
    doNameplateScaling: Function;
    togglePageToolbar: () => void;
    tokenDrawBg: (ctx: CanvasRenderingContext2D, graphic: CanvasObject) => void;
    pingInitiativeToken: (token: Token) => void;
    setModePrologue: (mode: string) => void;
    update_layer_indicator: (mode: string) => void;
    selectInitiativeToken: (token: Token) => void;
    keys: R20ESKeys;
    replaceIdOnDupe: (original: CharacterEditor, clone: Character) => void;
    onJournalDuplicate: (id: string) => void;
    moveCameraTo: (tokenId: string) => void;
    hooks: {[id: string]: any};
    shouldDoCustomAnim: (key: string) => boolean;
    isWindowLoaded: boolean;
    onResizeCanvas: (width: number, height: number) => void;
    onZoomChange: (zoomCoef: number) => void;
    isLoading: boolean;

    onPageChange: any; /* is actually an EventEmitter.ts */
    onAppLoad: any; /* is actually an EventEmitter.ts */

    export_handout: Function;
    overwrite_handout : Function;
    
    receive_message_from_content_script: (e: any) => void;
    have_configs_been_loaded: boolean;
  }

  interface Mousetrap {
    bind: (keys: string, cb: Function) => Mousetrap_Data;
    unbind: (keys: string, cb?: Function) => void;
  }

  interface Mousetrap_Data {
    _directMap: Record<string, Function>;
  }

  interface SoundManager {
    createSound: (sound: {id: string, url: string}) => any;
  }
}

interface R20ESChrome {
  readyCallbacks: Array<Function>;
}

interface Window {
  r20esChrome: R20ESChrome;

  Jukebox: Roll20.GlobalJukebox;
  Campaign: Roll20.Campaign;
  d20: Roll20.D20;
  currentPlayer: Roll20.Player;
  is_gm: boolean;
  currentEditingLayer: string;
  generateUUID: () => string;
  Mousetrap: Roll20.Mousetrap;
  soundManager: Roll20.SoundManager;

  r20es: Roll20.R20ES;
  r20esInstalledModuleTable: {[id: string]: any};
  r20esDisposeTable: {[id: string]: any};

  r20es_set_layer: (name: string) => void;

  enhancementSuiteEnabled: boolean;
  injectBackgroundOK: boolean;
  injectWebsiteOK: boolean;
  hasInjectedModules: boolean;

  USERSCRIPT_VTT_BUNDLE_DATA : string | undefined;
  USERSCRIPT_BASE_DATA : string | undefined;
  USERSCRIPT_APP_DATA : string | undefined;

  Sprig: Function;

  sprig_safe_trampoline: Function;
}

const BUILD_CONSTANT_VERSION: string;
const BUILD_CONSTANT_COMMIT: string;
const BUILD_CONSTANT_BRANCH: string;
const BUILD_CONSTANT_TARGET_PLATFORM : string;
const BUILD_CONSTANT_CHANGELOG: string;
const BUILD_CONSTANT_VTTES_IS_DEV: boolean;
const BUILD_CONSTANT_LOGO_B64: string;

namespace VTTES {

  interface Replace_Stencil {
    search_from?: string;
    search_from_index_offset?: number;
    find: Array<string | number>;
    replace?: Array<string | number>;

    debug_find?: boolean;
    debug_replace?: boolean;
    debug_disable?: boolean;
  }

  interface Find_Replace {
    find: string;
    replace: string;

    stability_checks?: Array<string>;
  }

  interface Module_Mod {
    includes: string;

    stencils?: Array<Replace_Stencil>;
    find_replace?: Array<Find_Replace>;

    debug_disable_stencils?: boolean;
    debug_disable_find_replace?: boolean;
  }

  const enum Config_View_Type {
    Slider="slider",
    Dropdown="dropdown",
    Checkbox="checkbox",
    Number="number",
    Color="color",
    MouseButtonIndex="mouse_button_index",
    Text="string",
  }

  interface Config_View {
    type: Config_View_Type;
    display: string;

    sliderMin?: number;
    sliderMax?: number;

    dropdownValues?: Record<string | number, string>;

    onlyWhenHasB20?: boolean;
  }

  const enum Module_Category {
    canvas = "Canvas",
    exportImport = "Exporting/Importing",
    freedom = "Libre",
    initiative = "Initiative",
    token = "Token",
    journal = "Journal",
    misc = "Misc.",
  }

  interface Module_Config {
    filename: string;
    id: string;
    name: string;
    description: string;
    category: Module_Category;
    gmOnly: boolean;

    force?: boolean;
    forceShowConfig?: boolean;

    media?: Record<string, string>

    mods?: Array<Module_Mod>;

    configView?: Record<string, Config_View>;
    config?: Record<string,any>;

    urls?: Record<string, string>;
  }

}

}

