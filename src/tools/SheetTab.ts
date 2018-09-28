import {R20} from "./R20";
import {Character} from "roll20";
import {DOM} from "./DOM";

export class InternalSheetTabData {
    public tabs: SheetTab<any>[] = [];
    public tabsById: {[id: string]: SheetTab<any>} = {};

    public idTop: number = 0;
    public rescanFunc?: () => void = undefined;

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

    constructor(parent: SheetTab<T>) {
        this.parent = parent;
    }

    public rerender() {
        this.root = DOM.rerender(this.root, () => this.parent.renderFx(this));
    }

    public tryGetPc(): Character | null {
        if(!this.contentRoot) {
            return null;
        }

        console.log(this.contentRoot);

        let elem = null;
        if (this.contentRoot.hasAttribute("data-characterid")) {
            elem = this.contentRoot;
        } else {
            let query = $(this.contentRoot).closest("div[data-characterid]");
            if (!query) return null;
            elem = query[0];
        }

        if(!elem) return null;

        const pcId = elem.getAttribute("data-characterid");
        if (!pcId) return null;

        let pc = R20.getCharacter(pcId);
        if (!pc) return null;

        return pc;
    }
}

export class SheetTab<T> {

    public name: string;
    public renderFx: (instance?: SheetTabSheetInstanceData<T>) => HTMLElement;
    public id: string;
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
            this.byIdSheetData[charId] = new SheetTabSheetInstanceData(this);
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
                      onShow?: (instance?: SheetTabSheetInstanceData<T>) => void) {
        const data = SheetTab._getInternalData();
        let tab = new SheetTab(name, renderFx, `r20es-character-sheet-tab-${data.idTop++}`, onShow);
        data.addTab(tab);

        if (typeof(data.rescanFunc) === "function") {
            data.rescanFunc();
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
