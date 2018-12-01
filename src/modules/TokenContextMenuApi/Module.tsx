import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";
import { DOM } from "../../utils/DOM";
import { findByIdAndRemove } from "../../utils/MiscUtils";
import { TokenContextMenu } from "../../utils/TokenContextMenu";

class TokenContextMenuApiModule extends R20Module.SimpleBase {
    private _observer: MutationObserver;

    public constructor() {
        super(__dirname);
    }

    private tryInsertMenuWidgets(target: HTMLElement) {

        if(!target.className) return false;
        if(target.className !== "actions_menu d20contextmenu")  return false;

        const all = TokenContextMenu.getInternalData().widgets;
        const selection = R20.getSelectedTokens();

        for(const data of all)
        {
            if(data.options && data.options.mustHaveSelection && selection.length <= 0)
                continue;

            const clicked = (e) => {
                e.stopPropagation();

                R20.hideTokenRadialMenu();
                R20.hideTokenContextMenu();

                data.callback();
            };

            const widget = <li id={data.id} onClick={clicked} class='head hasSub'>{data.text}</li>;
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

    public setup() {
        this._observer = new MutationObserver(this.observerCallback);
        this._observer.observe(document.body, { childList: true, subtree: true });
    }

    public dispose() {
        const all = TokenContextMenu.getInternalData().widgets;

        for(const data of all) {
            findByIdAndRemove(data.id);
        }

        if(this._observer) {
            this._observer.disconnect();
        }
    }
}

if (R20Module.canInstall()) new TokenContextMenuApiModule().install();


