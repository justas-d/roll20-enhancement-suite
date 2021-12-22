import {R20} from "./R20";
import {DOM} from "./DOM";

export class InternalSheetTabData {
    public tabs: SheetTab<any>[] = [];
    public tabsById: {[id: string]: SheetTab<any>} = {};

    public idTop: number = 0;
    public rescanFunc?: (tab: SheetTab<any>) => void = undefined;

    public addTab(tab: SheetTab<any>) {
        this.tabs.push(tab);
        this.tabsById[tab.id] = tab;
    }

    public removeTab(tab: SheetTab<any>) {
        delete this.tabsById[tab.id];

        let idx = this.tabs.length;

        while (idx-- > 0) {
            const cur = this.tabs[idx];

            if (cur.id === tab.id) {
                this.tabs.splice(idx, 1);
            }
        }
    }
}

export class SheetTabSheetInstanceData<T> {
  public root: HTMLElement;
  public userData: T;
  public parent: SheetTab<T>;
  public contentRoot: HTMLElement;
  public characterId: string;

  constructor(parent: SheetTab<T>, charId: string) {
    this.parent = parent;
    this.characterId = charId;
  }

  public rerender() {
    this.root = DOM.rerender(this.root, () => this.parent.renderFx(this));
  }
}

export class SheetTab<T> {

    public name: string;
    public renderFx: (instance?: SheetTabSheetInstanceData<T>) => HTMLElement;
    public id: string;

    public predicate: ((char: Roll20.Character) => boolean) | null;
    public onShow: ((instance?: SheetTabSheetInstanceData<T>) => void) | null;
    public byIdSheetData: {[charId: string]: SheetTabSheetInstanceData<T>} = {};

    private _elements: HTMLElement[] = [];
    private _contentRoot:HTMLElement;

    private constructor(name: string,
                        fx: (instance?: SheetTabSheetInstanceData<T>) => HTMLElement,
                        id: string,
                        onShow?: (instance?: SheetTabSheetInstanceData<T>) => void) {
        this.name = name;
        this.renderFx = fx;
        this.id = id;
        this._contentRoot = null;
        this.onShow = onShow;
    }

    public getInstanceData(charId: string): SheetTabSheetInstanceData<T> {
        if(!(charId in this.byIdSheetData)) {
            this.byIdSheetData[charId] = new SheetTabSheetInstanceData(this, charId);
        }
        return this.byIdSheetData[charId];
    }

    public _addElem(el: HTMLElement) {
        this._elements.push(el);
    }

    public static _getInternalData(): InternalSheetTabData {
        if (!("sheetTabData" in window.r20es)) {
            window.r20es["sheetTabData"] = new InternalSheetTabData();
        }

        return window.r20es["sheetTabData"];
    }

    public static add<T>(name: string,
                      renderFx: (instance?: SheetTabSheetInstanceData<T>) => HTMLElement,
                      onShow?: (instance?: SheetTabSheetInstanceData<T>) => void,
                      predicate? : (char: Roll20.Character) => boolean) {
        const data = SheetTab._getInternalData();
        let tab = new SheetTab(name, renderFx, `r20es-character-sheet-tab-${data.idTop++}`, onShow);
        tab.predicate = predicate;

        data.addTab(tab);

        if(typeof(data.rescanFunc) === "function") {
          data.rescanFunc(tab);
        }
        
        return tab;
    }

    public dispose() {
        this._elements.forEach(el => el.remove());
        this._elements = [];

        const data = SheetTab._getInternalData();
        data.removeTab(this);
    }
}
