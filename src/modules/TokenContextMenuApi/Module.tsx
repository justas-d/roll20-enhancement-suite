import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";
import { DOM } from "../../utils/DOM";
import { findByIdAndRemove } from "../../utils/MiscUtils";
import { TokenContextMenu } from "../../utils/TokenContextMenu";
import { replaceAll} from "../../utils/MiscUtils";

class TokenContextMenuApiModule extends R20Module.OnAppLoadBase {
  private _observer: MutationObserver;

  private elements: Array<HTMLElement> = [];

  public constructor() {
    super(__dirname);
  }

  private tryInsertMenuWidgets(target: HTMLElement) {
    if(!target.className) return false;
    if(target.className !== "actions_menu d20contextmenu")  return false;

    const all = TokenContextMenu.getInternalData().widgets;
    const selection = R20.getSelectedTokens();

    for(const key in all) {
      const data = all[key];

      if(data.options && data.options.mustHaveSelection && selection.length <= 0) {
        continue;
      }

      if(data.options && data.options.cannotHaveSelection && selection.length > 0) {
        continue
      }

      const clicked = (e) => {
        e.stopPropagation();

        R20.hideTokenRadialMenu();
        R20.hideTokenContextMenu();

        data.callback();
      };

      const widget = <li style={{maxWidth: "99px"}} id={data.id} onClick={clicked} class='head hasSub'>{data.text}</li>;
      target.firstElementChild.appendChild(widget);
    }

    return true;
  }

  private observerCallback = (muts) => {
    for(let e of muts) {
      for(const added of e.addedNodes) {
        if(this.tryInsertMenuWidgets(added)) {
            return;
        }
      }
    }
  };

  original_actions_menu_template: string | null = null;

  try_get_actions_menu_template() {
    const template = document.body.querySelector("#tmpl_actions_menu");
    if(template == null) {
      console.error("TokenContextMenu: failed to find tmpl_actions_menu");
    }
    return template as HTMLElement | null;
  }

  public setup() {
    this._observer = new MutationObserver(this.observerCallback);
    this._observer.observe(document.body, { childList: true, subtree: true });

    var template = this.try_get_actions_menu_template();
    if(template) {
      let text = template.innerHTML;

      this.original_actions_menu_template = text;

      // NOTE(justasd): 'this' and 'this.get' may not exist. Roll20 skimped on these checks at
      // around the 2023-08-10 update which added the Open Character entry I believe and so they
      // broke right-clicking on empty canvas space. In that context, the this may not exist so this
      // breaks the template instantiation.
      //
      // Ugh.
      //
      // Anyway they might not fix it for a while as this doesn't seem like an important thing
      // anymore given the new UI rework, so we'll keep this in here.
      //
      // 2023-08-14
      text = replaceAll(text, `this.get("represents")`, `(this && this.get && this.get("represents"))`)

      template.innerHTML = text;
    }

    {
      const ctx_menu = document.querySelector(".context-menu");
      if(ctx_menu == null) {
        console.error(".context-menu is not found while registering TokenContextMenuApi stuff for non-token menus");
      }
      else {
        const all = TokenContextMenu.getInternalData().widgets;

        for(const key in all) {
          const data = all[key];

          if(data.options && data.options.mustHaveSelection) {
            continue;
          }

          const btn = $(".context-menu button").first().clone()[0];

          // @ts-ignore
          btn.children[1].innerText = data.text;
          btn.children[0].remove();

          btn.addEventListener("click", (e) => {
            e.stopPropagation();

            R20.hideTokenRadialMenu();
            R20.hideTokenContextMenu();

            data.callback();
          });
          btn.id = data.id;

          ctx_menu.appendChild(btn);

          this.elements.push(btn);
        }
      }
    }
  }

  public dispose() {
    for(var el of this.elements) {
      el.remove();
    }
    this.elements = [];

    const all = TokenContextMenu.getInternalData().widgets;

    if(this.original_actions_menu_template != null) {
      let template = this.try_get_actions_menu_template();

      if(template != null) {
        template.innerHTML = this.original_actions_menu_template;
        this.original_actions_menu_template = null;
      }
    }

    for(const key in all) {
      const data = all[key];
      findByIdAndRemove(data.id);
    }

    if(this._observer) {
      this._observer.disconnect();
    }
  }
}

export default () => {
  new TokenContextMenuApiModule().install();
};

