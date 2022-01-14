import { R20Module } from '../../utils/R20Module'
import { DOM } from '../../utils/DOM'
import { SheetTab } from '../../utils/SheetTab';
import { R20 } from "../../utils/R20";
import { promiseWait } from "../../utils/promiseWait";

const CHAR_ID_ATTRIBUTE = "data-characterid";
const ATTRIB_NAV_HAS_LISTENER = "data-r20es-character-sheet-nav-event";
const TAB_STYLE = "r20es-character-sheet-tab";
const ATTRIB_CUSTOM_NAV = "data-r20es-nav";

class SheetTabApiModule extends R20Module.OnAppLoadBase {
  observer: MutationObserver;
  infectedNavs: Array<HTMLElement>;

  constructor() {
    super(__dirname);

    this.observerCallback = this.observerCallback.bind(this);
    this.try_injecting_single_widget = this.try_injecting_single_widget.bind(this);
    this.try_injecting_widget = this.try_injecting_widget.bind(this);
    this.navOnClick = this.navOnClick.bind(this);
    this.onClickNormalNavs = this.onClickNormalNavs.bind(this);
    this.rescan = this.rescan.bind(this);

    // bookkeeping for disposal
    this.infectedNavs = [];
  }

  getWidgetTabRoots(navAElement) {
    return $(navAElement.parentNode.parentNode.parentNode).find("." + TAB_STYLE);
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

    const char_id = e.target.getAttribute(CHAR_ID_ATTRIBUTE);
    const tabInstance = tab.getInstanceData(char_id);

    //console.log(tabInstance);

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

  try_injecting_widget(target) {
    const data = SheetTab._getInternalData();

    for (const tab of data.tabs) {
      this.try_injecting_single_widget(target, tab);
    }
  }

  async try_injecting_single_widget(iframe, tab) {
    if(!iframe) return false;
    if(iframe.nodeName != "IFRAME") return false;

    const character_dialog = iframe.parentNode;
    if(!character_dialog) return false
    if(!character_dialog.classList.contains("characterdialog")) return false;

    const characterId = character_dialog.getAttribute(CHAR_ID_ATTRIBUTE);

    if(tab.predicate) {
      const char = R20.getCharacter(characterId);
      if(!tab.predicate(char)) {
        return;
      }
    }

    //console.log("iframe is", iframe);

    const wait_for_load = new Promise(ok => {
      if(iframe.contentDocument.readyState == "complete") {
        ok();
        return;
      }

      const listener = () => {
        iframe.removeEventListener("load", listener);
        ok();
      }

      iframe.addEventListener("load", listener);
    });

    await wait_for_load;

    //console.log("iframe loaded");

    let navTabsRoot = null

    let body = null;

    const retry = new Promise(ok => {
      const retry_interval = 1000;
      const check = () => {

        if(iframe.contentDocument) {
          body = iframe.contentDocument.body;
          //console.log("body", body);
          if(body) {
            const dialog = body.querySelector("#dialog-window");

            //console.log("dialog", dialog);

            if(dialog) {
              navTabsRoot = dialog.querySelector(".nav-tabs");

              //console.log("navTabsRoot", navTabsRoot);

              if(navTabsRoot) {
                ok();
                return;
              }
            }
          }
        }

        setTimeout(check, retry_interval);
      };

      setTimeout(check, retry_interval);
    });

    const timeout = promiseWait(10000);

    await Promise.race([retry, timeout]);

    //console.log("navTabsRoot", navTabsRoot);

    if(navTabsRoot) {

      {
        const query_string = `[data-tab=${tab.id}]`
        const query = navTabsRoot.querySelector(query_string);
        //console.log(navTabsRoot, query_string, query);
        if(query) {
          return false;
        }
      }

      const nav = (
        <li>
          <a 
            onClick={this.navOnClick} 
            data-tab={tab.id} 
            href="javascript:void(0);"
            data-characterid={characterId}
          >
            {tab.name}
          </a>
        </li>
      );

      nav.firstElementChild.setAttribute(ATTRIB_CUSTOM_NAV, true);

      tab._addElem(nav);

      navTabsRoot.appendChild(nav);

      // register an event handler on the normal navbar tabs
      // onClickNormalNavs will hide the custom stuff, state active state for the custom nav
      $(navTabsRoot).find("a[data-tab]").each((i, el) => {
        if (el.hasAttribute(ATTRIB_CUSTOM_NAV)) return;
        if (el.hasAttribute(ATTRIB_NAV_HAS_LISTENER)) return;

        el.setAttribute(ATTRIB_NAV_HAS_LISTENER, true);
        el.addEventListener("click", this.onClickNormalNavs);
        this.infectedNavs.push(el);
      });

      const tabInstanceData = tab.getInstanceData(characterId);

      const renderFxResult = tab.renderFx(tabInstanceData);

      const tabroot = body.querySelector(".tab-content");
      tabInstanceData.contentRoot = tabroot;
      tabInstanceData.root = renderFxResult;

      const widget = (
        <div className={[TAB_STYLE, tab.id, "tab-pane"]} style={{ display: "none" }}>
          {renderFxResult}
        </div>
      );

      tab._addElem(widget);
      tabroot.appendChild(widget);
    }
    else {
      console.error("SheetTab: Could not find navTabsRoot :(");
    }

    return true;
  }

  observerCallback(muts) {
    for (var e of muts) {
      for (const added of e.addedNodes) {
        if(this.try_injecting_widget(added)) {
          return;
        }
      }

      if(this.try_injecting_widget(e.target)) {
        return;
      }
    }
  }

  rescan(tab) {
    const existingHeaders = document.querySelectorAll("iframe");
    existingHeaders.forEach(header => {
      this.try_injecting_single_widget(header, tab);
    });
  }

  setup() {
    this.observer = new MutationObserver(this.observerCallback);
    this.observer.observe(document.body, { childList: true, subtree: true });

    {
      const existingHeaders = document.querySelectorAll("iframe");
      existingHeaders.forEach(header => {
        this.try_injecting_widget(header);
      });
    }

    SheetTab._getInternalData().rescanFunc = this.rescan;
  }

  dispose() {
    SheetTab._getInternalData().rescanFunc = null;

    const data = SheetTab._getInternalData();
    for(const tab of data.tabs) {
      tab.dispose();
    }
    data.tabs = [];

    for(const el of this.infectedNavs) {
      el.removeEventListener("click", this.onClickNormalNavs);
      el.removeAttribute(ATTRIB_NAV_HAS_LISTENER);
    }

    this.infectedNavs.length = 0;

    if (this.observer) this.observer.disconnect();
  }
}

export default () => {
  new SheetTabApiModule().install();
};

