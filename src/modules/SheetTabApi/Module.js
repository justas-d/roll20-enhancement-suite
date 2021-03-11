import { R20Module } from '../../utils/R20Module'
import { DOM } from '../../utils/DOM'
import { SheetTab } from '../../utils/SheetTab';
import { R20 } from "../../utils/R20";

const charIdAttribute = "data-characterid";

class SheetTabApiModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__dirname);

        this.observerCallback = this.observerCallback.bind(this);
        this.tryInjectingSingleWidget = this.tryInjectingSingleWidget.bind(this);
        this.tryInjectingWidget = this.tryInjectingWidget.bind(this);
        this.navOnClick = this.navOnClick.bind(this);
        this.onClickNormalNavs = this.onClickNormalNavs.bind(this);
        this.rescan = this.rescan.bind(this);

        this.tabStyle = "r20es-character-sheet-tab";
        this.attribNavHasListener = "data-r20es-character-sheet-nav-event";
        this.attribCustomNav = "data-r20es-nav";

        // bookkeeping for disposal
        this.infectedNavs = [];
    }

    getWidgetTabRoots(navAElement) {
        return $(navAElement.parentNode.parentNode.parentNode).find("." + this.tabStyle);
    }

    unselectSyntheticNavs(e) {
        const navTabsRoot = e.target.parentNode.parentNode;
        $(navTabsRoot).find("a[data-r20es-nav]").each((i, el) => {
            el.parentNode.classList.remove("active");
        });
    }

    onClickNormalNavs(e) {

        this.unselectSyntheticNavs(e);
        this.getWidgetTabRoots(e.target).each((i, obj) => {
            obj.style.display = "none";
        });
    }

    navOnClick(e) {
        const targetTabClass = e.target.getAttribute("data-tab");

        const internalTabs = SheetTab._getInternalData();
        const tab = internalTabs.tabsById[targetTabClass];

        const charRoot = $(e.target).closest(`[${charIdAttribute}]`)[0];
        console.log(charRoot);
        let tabInstance = null;
        if(charRoot && charRoot.hasAttribute(charIdAttribute)) {
            tabInstance = tab.getInstanceData(charRoot.getAttribute(charIdAttribute))
        }

        if(tab && tab.onShow) {
            tab.onShow(tabInstance);
        }

        this.unselectSyntheticNavs(e);
        e.target.parentNode.classList.add("active");

        this.getWidgetTabRoots(e.target).each((i, obj) => {
            obj.style.display = obj.classList.contains(targetTabClass)
                ? "block"
                : "none";
        });
    }

    tryInjectingWidget(target) {
        const data = SheetTab._getInternalData();

        for (const tab of data.tabs) {
            this.tryInjectingSingleWidget(target, tab);
        }
    }

    tryInjectingSingleWidget(target, tab) {

        if (!target) return false;
        if (!target.className) return false;
        if (!target.hasAttribute(charIdAttribute)) return false;
        if (target.getElementsByClassName(tab.id).length > 0) return;
        if ($(target).find(".charactereditor").length > 0) return;

        const characterId = target.getAttribute(charIdAttribute);

        if(tab.predicate) {

            const char = R20.getCharacter(characterId);

            if(!tab.predicate(char)) {
                return;
            }
        }

        const nav = (
            <li>
                <a onClick={this.navOnClick} data-tab={tab.id} href="javascript:void(0);">
                    {tab.name}
                </a>
            </li>
        );
        nav.firstElementChild.setAttribute(this.attribCustomNav, true);

        tab._addElem(nav);
        target.firstElementChild.firstElementChild.appendChild(nav);


        // register an event handler on the normal navbar tabs
        // onClickNormalNavs will hide the custom stuff, state active state for the custom nav
        const navTabsRoot = target.firstElementChild.firstElementChild;
        $(navTabsRoot).find("a[data-tab]").each((i, el) => {
            if (el.hasAttribute(this.attribCustomNav)) return;
            if (el.hasAttribute(this.attribNavHasListener)) return;

            el.setAttribute(this.attribNavHasListener, true);
            el.addEventListener("click", this.onClickNormalNavs);
            this.infectedNavs.push(el);
        });


        const tabInstanceData = tab.getInstanceData(characterId);

        const tabroot = $(target.firstElementChild).find(".tab-content")[0];
        const renderFxResult = tab.renderFx(tabInstanceData);

        tabInstanceData.contentRoot = tabroot;
        tabInstanceData.root = renderFxResult;

        const widget = (
            <div className={[this.tabStyle, tab.id, "tab-pane"]} style={{ display: "none" }}>
                {renderFxResult}
            </div>
        );

        tab._addElem(widget);
        tabroot.appendChild(widget);

        return true;
    }

    observerCallback(muts) {
        for (var e of muts) {
            for (const added of e.addedNodes) {
                if (this.tryInjectingWidget(added)) {
                    return;
                }
            }

            if (this.tryInjectingWidget(e.target)) {
                return;
            }
        }
    }

    rescan() {
        const existingHeaders = document.querySelectorAll("div[data-characterid].dialog.characterdialog");

        for (const header of existingHeaders) {
            console.log(header);
            this.tryInjectingWidget(header);
        }
    }

    setup() {
        this.rescan();
        SheetTab._getInternalData().rescanFunc = this.rescan;

        this.observer = new MutationObserver(this.observerCallback);
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    dispose() {
        SheetTab._getInternalData().rescanFunc = null;

        const data = SheetTab._getInternalData();
        for (const tab of data.tabs) {
            tab.dispose();
        }
        data.tabs = [];

        this.infectedNavs.each(el => {
            el.removeEventListener("click", this.onClickNormalNavs);
            el.removeAttribute(this.attribNavHasListener);
        });
        this.infectedNavs.length = 0;

        if (this.observer) this.observer.disconnect();
    }
}

if (R20Module.canInstall()) new SheetTabApiModule().install();
