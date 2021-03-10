import { R20Module } from '../../utils/R20Module'
import { DOM } from '../../utils/DOM'
import { SheetTab } from '../../utils/SheetTab';
import { R20 } from "../../utils/R20";
import promiseWait from "../../utils/promiseWait";

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

      const char_id = e.target.getAttribute(charIdAttribute);
      const tabInstance = tab.getInstanceData(char_id);

      console.log(tabInstance);

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

    async tryInjectingSingleWidget(iframe, tab) {
      if(!iframe) return false;
      if(iframe.nodeName != "IFRAME") return false;

      const character_dialog = iframe.parentNode;
      if(!character_dialog) return false
      if(!character_dialog.classList.contains("characterdialog")) return false;

      const characterId = character_dialog.getAttribute(charIdAttribute);

      if(tab.predicate) {
        const char = R20.getCharacter(characterId);
        if(!tab.predicate(char)) {
          return;
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

      nav.firstElementChild.setAttribute(this.attribCustomNav, true);

      tab._addElem(nav);

      console.log("iframe is", iframe);

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

      console.log("iframe loaded");

      let navTabsRoot = null

      let body = null;

      const retry = new Promise(ok => {
        const retry_interval = 1000;
        const check = () => {

          body = iframe.contentDocument.body;
          console.log("body", body);
          if(body) {
            const dialog = body.querySelector("#dialog-window");

            console.log("dialog", dialog);

            if(dialog) {
              navTabsRoot = dialog.querySelector(".nav-tabs");

              console.log("navTabsRoot", navTabsRoot);

              if(navTabsRoot) {
                ok();
                return;
              }
            }
          }

          setTimeout(check, retry_interval);
        };

        setTimeout(check, retry_interval);
      });

      const timeout = promiseWait(10000)

      await Promise.race([retry, timeout]);
      console.log("navTabsRoot", navTabsRoot);

      if(navTabsRoot) {
        navTabsRoot.appendChild(nav);

        // register an event handler on the normal navbar tabs
        // onClickNormalNavs will hide the custom stuff, state active state for the custom nav
        $(navTabsRoot).find("a[data-tab]").each((i, el) => {
          if (el.hasAttribute(this.attribCustomNav)) return;
          if (el.hasAttribute(this.attribNavHasListener)) return;

          el.setAttribute(this.attribNavHasListener, true);
          el.addEventListener("click", this.onClickNormalNavs);
          this.infectedNavs.push(el);
        });

        const tabInstanceData = tab.getInstanceData(characterId);

        const renderFxResult = tab.renderFx(tabInstanceData);

        const tabroot = body.querySelector(".tab-content");
        tabInstanceData.contentRoot = tabroot;
        tabInstanceData.root = renderFxResult;

        const widget = (
          <div className={[this.tabStyle, tab.id, "tab-pane"]} style={{ display: "none" }}>
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
          if(this.tryInjectingWidget(added)) {
            return;
          }
        }

        if(this.tryInjectingWidget(e.target)) {
          return;
        }
      }
    }

    rescan(tab) {
      const existingHeaders = document.querySelectorAll("iframe");

      for (const header of existingHeaders) {
        this.tryInjectingSingleWidget(header, tab);
      }
    }

    setup() {
        this.observer = new MutationObserver(this.observerCallback);
        this.observer.observe(document.body, { childList: true, subtree: true });

        {
          const existingHeaders = document.querySelectorAll("iframe");

          for (const header of existingHeaders) {
            this.tryInjectingWidget(header);
          }
        }

        SheetTab._getInternalData().rescanFunc = this.rescan;
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
