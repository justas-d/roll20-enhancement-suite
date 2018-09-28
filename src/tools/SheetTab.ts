import {R20} from "./R20";
import {Character} from "roll20";

export class InternalSheetTabData {
    public tabs: SheetTab[] = [];
    public tabsById: {[id: string]: SheetTab} = {};

    public idTop: number = 0;
    public rescanFunc?: () => void = undefined;

    public addTab(tab: SheetTab) {
        this.tabs.push(tab);
        this.tabsById[tab.id] = tab;
    }

    public removeTab(tab: SheetTab) {
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

export class SheetTab {

    public name: string;
    public renderFx: () => HTMLElement;
    public id: string;
    public onShow: (() => void) | null;
    public root: HTMLElement = null;

    private _elements: HTMLElement[] = [];
    private _contentRoot:HTMLElement;

    private constructor(name: string, fx: () => HTMLElement, id: string, onShow?: () => void) {
        this.name = name;
        this.renderFx = fx;
        this.id = id;
        this._contentRoot = null;
        this.onShow = onShow;
    }

    public _addElem(el: HTMLElement) {
        this._elements.push(el);
    }

    public _setTabContentRoot(root: HTMLElement) {
        this._contentRoot = root;
    }

    public static _getInternalData(): InternalSheetTabData {
        if (!("sheetTabData" in window.r20es)) {
            window.r20es["sheetTabData"] = new InternalSheetTabData();
        }

        return window.r20es["sheetTabData"];
    }

    public static add(name: string, renderFx: () => HTMLElement, onShow?: () => void) {
        const data = SheetTab._getInternalData();
        let tab = new SheetTab(name, renderFx, `r20es-character-sheet-tab-${data.idTop++}`, onShow);
        data.addTab(tab);

        if (typeof(data.rescanFunc) === "function") {
            data.rescanFunc();
        }
        
        return tab;
    }

    public tryGetPc(): Character | null {
        if(!this._contentRoot) {
            return null;
        }

        console.log(this._contentRoot);

        let elem = null;
        if (this._contentRoot.hasAttribute("data-characterid")) {
            elem = this._contentRoot;
        } else {
            let query = $(this._contentRoot).closest("div[data-characterid]");
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

    public dispose() {
        this._elements.forEach(el => el.remove());
        this._elements = [];

        const data = SheetTab._getInternalData();
        data.removeTab(this);
    }
}
