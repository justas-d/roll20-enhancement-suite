import {R20} from "./R20";
import {Character} from "roll20";

export class InternalSheetTabData {
    public tabs: SheetTab[] = [];
    public idTop: number = 0;
    public rescanFunc?: () => void = undefined;
}

export class SheetTab {

    public name: string;
    public renderFx: () => HTMLElement;
    public id: string;

    private _elements: HTMLElement[] = [];
    private _root:HTMLElement;

    private constructor(name: string, fx: () => HTMLElement, id: string) {
        this.name = name;
        this.renderFx = fx;
        this.id = id;
        this._root = null;
    }

    public _addElem(el: HTMLElement) {
        this._elements.push(el);
    }

    public _setWidgetRoot(root: HTMLElement) {
        this._root = root;
    }

    public static _getInternalData(): InternalSheetTabData {
        if (!("sheetTabData" in window.r20es)) {
            window.r20es["sheetTabData"] = new InternalSheetTabData();
        }

        return window.r20es["sheetTabData"];
    }

    public static add(name: string, renderFx: () => HTMLElement) {
        const data = SheetTab._getInternalData();
        let tab = new SheetTab(name, renderFx, `r20es-character-sheet-tab-${data.idTop++}`);
        data.tabs.push(tab);

        if (typeof(data.rescanFunc) === "function") {
            data.rescanFunc();
        }
        
        return tab;
    }

    public tryGetPc(): Character | null {
        if(!this._root) {
            return null;
        }




        let elem = null;
        if (this._root.hasAttribute("data-characterid")) {
            elem = this._root;
        } else {
            let query = $(this._root).closest("div[data-characterid]");
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
        let idx = data.tabs.length;

        while (idx-- > 0) {
            const cur = data.tabs[idx];

            if (cur.id === this.id) {
                data.tabs.splice(idx, 1);
            }
        }
    }
}
