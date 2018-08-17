class SheetTab {
    // dont use this, use SheetTab.add
    constructor(name, fx, id) {
        this.name = name;
        this.renderFx = fx;
        this.id = id;

        this._elements = [];
    }

    _addElem(el) {
        this._elements.push(el);
    }

    static _getInternalData() {
        if (!("sheetTabData" in window.r20es)) {
            window.r20es.sheetTabData = {
                tabs: [],
                idTop: 0,
            };
        }

        return window.r20es.sheetTabData;
    }

    static add(name, renderFx) {
        const data = SheetTab._getInternalData();
        let tab = new SheetTab(name, renderFx, `r20es-character-sheet-tab-${data.idTop++}`);
        data.tabs.push(tab);
        data.rescanFunc();
        return tab;
    }

    dispose() {
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

export { SheetTab };
