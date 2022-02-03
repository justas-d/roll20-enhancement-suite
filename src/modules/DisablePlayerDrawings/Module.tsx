import { R20Module } from '../../utils/R20Module'
import { DOM } from '../../utils/DOM'
import {R20} from "../../utils/R20";
import {Optional} from "../../utils/TypescriptUtils";

interface MapObj {
  page_id: string,
  controlledby: string
}

class DisablePlayerDrawings extends R20Module.OnAppLoadBase {
  constructor() {
      super(__dirname);
  }

  _observer: MutationObserver;
  _shouldIgnoreEvents = false;
  _muteButtonClass = "r20es-mute-drawing-button";
  _muteButtonDisablePicClass = "r20es-mute-drawing-button-disable";
  _playerCardQuery = "#playerzone .player";
  _storageKey = "r20es_player_ids_by_who_can_draw";

  handleObjectPlacement = (
    data: Roll20.FirebaseReference<MapObj>, 
    dataPoolGetter: (page: Roll20.Page) => Roll20.ObjectStorage<Roll20.SyncObject<MapObj>>
  ) => {
    if(this._shouldIgnoreEvents) {
      return;
    }

    var attribs = data.val();

    const page = R20.getPageById(attribs.page_id);

    if(!page) {
      this.reportThatWeDontHaveThePageObject();
      return;
    }

    const object = dataPoolGetter(page).get(data.key);
    if(!object) {
      this.reportThatWeDontHaveTheInnerPageObject();
      return;
    }

    if(!this.canPlaceObjects(object.attributes.controlledby)) {
      object.destroy();
    }
  };

  canPlaceObjects = (playerId: string) => {
    const data = this.getStorage();

    if(typeof data[playerId] === "boolean") {
      return data[playerId];
    }

    return true;
  };

  onTextAdded = (firebaseObject: Roll20.FirebaseReference<Roll20.TextTokenAttributes>) => {
    this.handleObjectPlacement(firebaseObject, (page) => page.thetexts);
  };

  onDrawingAdded = (firebaseObject: Roll20.FirebaseReference<Roll20.PathTokenAttributes>) => {
    this.handleObjectPlacement(firebaseObject, (page) => page.thepaths);
  };

  unhookPage = (page: Roll20.Page) => {
    page.thepaths.backboneFirebase.reference.off("child_added", this.onDrawingAdded);
    page.thetexts.backboneFirebase.reference.off("child_added", this.onTextAdded);
  };

  reportThatWeDontHaveTheInnerPageObject = () => {
    console.error(`[DisablePlayerDrawings] find inner page object after receiving firebase event!`);
  };

  reportThatWeDontHaveThePageObject = () => {
    console.error("[DisablePlayerDrawings] onPageAdded failed to find wrapped page object after receiving firebase event!");
  };

  onPageAdded = (firebaseObject: Roll20.FirebaseReference<Roll20.PageAttributes>) => {
    const page = R20.getPageById(firebaseObject.key);

    if(!page) {
      this.reportThatWeDontHaveThePageObject();
      return;
    }

    // TODO(justasd): @HACK
    // This will ensure that thepaths and thetexts are created before we access them.
    // It's not performant however.
    // 2022-02-03
    page.fullyLoadPage();

    // NOTE(justas): initialization of backboneFirebase.reference is
    // delayed a bit here for whatever reason by roll20
    // So we're delaying too
    setTimeout(() => {
      page.thepaths.backboneFirebase.reference.on("child_added", this.onDrawingAdded);
      page.thetexts.backboneFirebase.reference.on("child_added", this.onTextAdded);
    }, 1000);
  };

  onPageRemoved = (firebaseObject: Roll20.FirebaseReference<Roll20.PageAttributes>) => {
    const page = R20.getPageById(firebaseObject.key);

    if(!page) {
      this.reportThatWeDontHaveThePageObject();
      return;
    }

    this.unhookPage(page);
  };

  uiIsPlayerSquare = (node: Node): boolean => {
    if(!node["classList"]) return false;
    if(!node["id"]) return false;

    const el = node as HTMLElement;
    return el.classList.contains("player") && el.id.startsWith("player_") && !el.id.includes(R20.getCurrentPlayer().id);
  };

  getPlayerSquareById = (playerId: string): Optional<HTMLElement> => {
    const query = $(this._playerCardQuery) as any as HTMLElement[];
    for(const el of query) {
      if (!this.uiIsPlayerSquare(el)) {
        continue;
      }

      const id = this.uiGetPlayerIdFromRoot(el);
      if(id === playerId) {
        return el;
      }
    }

    return undefined;
  };

  getStorage = () => {
    return window.Campaign.attributes[this._storageKey] || {};
  };

  saveStorage = (data: {[id: string]: boolean}) => {
    window.Campaign.save({
      [this._storageKey]: data
    });
  };

  toggleMute = (playerId: string) => {

    const data = this.getStorage();

    if(typeof data[playerId] !== "boolean") {
      data[playerId] = false;
    } else {
      data[playerId] = !data[playerId];
    }

    const newVal = data[playerId];

    this.saveStorage(data);
    console.log(data);

    const square = this.getPlayerSquareById(playerId);
    if(!square) {
      this.uiReportMissingPlayerSquare(playerId);
      return;
    }

    const button = this.uiGetMuteButton(square);
    const disablePic = $(button).find(`.${this._muteButtonDisablePicClass}`)[0] as HTMLElement;
    disablePic.style.visibility = newVal ? "hidden" : "visible";
  };

  uiOnMuteButtonClick = (e: Event) => {
    const target = e.target as HTMLElement;
    const root = $(target).closest(this._playerCardQuery)[0];

    if(!root) {
      this.uiReportMissingButtonRoot(target);
      return;
    }

    this.toggleMute(this.uiGetPlayerIdFromRoot(root));
  };

  uiReportMissingPlayerSquare= (pid: string) => {
    console.error("[DisablePlayerDrawing] failed to find root player square div for id: ", pid);
  };

  uiReportMissingButtonRoot = (mute: HTMLElement) => {
    console.error("[DisablePlayerDrawing] failed to find root player square div after clicking mute button: ", mute);
  };

  uiGetMuteButton = (controls: HTMLElement): HTMLElement => {
    return $(controls).find(`.${this._muteButtonClass}`)[0];
  };

  uiGetPlayerIdFromRoot = (root: HTMLElement) => {
    return root.id.replace("player_", "");
  };

  uiAddMuteButton = (root: HTMLElement) => {
    console.log("add mute button to", root);

    // don't add duplicates
    if(this.uiGetMuteButton(root)) {
      return;
    }

    const style = {
      position: "absolute",
      width: "30px",
      height: "30px",
      top: "0px",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      left: "0px",
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
      cursor: "pointer"
    };

    const button = (
      <div className={this._muteButtonClass} style={style}>
        <span className="pictos" style={{
          position: "absolute",
          fontSize: "18px"
        }}>p</span>
        <span className={`pictos ${this._muteButtonDisablePicClass}`} style={{
          position: "absolute",
          fontSize: "22px",
          visibility: this.canPlaceObjects(this.uiGetPlayerIdFromRoot(root)) ? "hidden" : "visible",
        }}>d</span>
      </div>
    );

    button.addEventListener("click", this.uiOnMuteButtonClick);

    root.appendChild(button);
  };

  uiRemoveMuteButton = (root: HTMLElement) => {
    const button = this.uiGetMuteButton(root);
    if(!button) {
      return;
    }

    button.remove();
  };

  observerCallback = (mutations: MutationRecord[]) => {
    for(const mut of mutations) {

      if(mut.target["id"] !== "avatarContainer")  {
        continue;
      }

      mut.addedNodes.forEach(n => {
        if(!this.uiIsPlayerSquare(n)) {
          return;
        }

        this.uiAddMuteButton(n as HTMLElement);
      });
    }
  };

  public uiForEachPlayerSquare = (fx: (el: HTMLElement) => void) => {
    document.querySelectorAll(this._playerCardQuery).forEach(el => {
      if(!this.uiIsPlayerSquare(el)) {
        return;
      }

      fx(el as HTMLElement);
    })
  };

  public setup = () => {
    if(!R20.isGM()) {
      return;
    }

    /*
      Note(justas):
        firebase's on("child_added") fires the callback for each initial value and each new value.
        Since we only want onTextAdded & onDrawingAdded to be called when there are new respective
        objects added to the page, this functionality is not useful to us.

        According to the firebase docs (https://www.firebase.com/docs/web/api/query/on.html)
        there's no way around this (thanks, google).
        So we have to resort to a @HACK and ignore events for the first second after init.
    */

    this._shouldIgnoreEvents = true;

    window.Campaign.pages.backboneFirebase.reference.on("child_added", this.onPageAdded);
    window.Campaign.pages.backboneFirebase.reference.on("child_removed", this.onPageRemoved);

    setTimeout(() => {
      this._shouldIgnoreEvents = false;
    }, 1000);

    this._observer = new MutationObserver(this.observerCallback);
    this._observer.observe(document.body, { childList: true, subtree: true });

    this.uiForEachPlayerSquare(this.uiAddMuteButton);
  };

  public dispose = () => {
      super.dispose();

      if(!R20.isGM()) {
          return;
      }

      this._observer.disconnect();

      for(const page of R20.getAllPages()) {
          this.unhookPage(page);
      }

      window.Campaign.pages.backboneFirebase.reference.off("child_added", this.onPageAdded);
      window.Campaign.pages.backboneFirebase.reference.off("child_removed", this.onPageRemoved);

      this.uiForEachPlayerSquare(this.uiRemoveMuteButton);
  }
}

export default () => {
  new DisablePlayerDrawings().install();
};

