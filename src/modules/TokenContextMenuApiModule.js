import { R20Module } from "../tools/R20Module";
import { R20 } from "../tools/R20";
import { createElementJsx } from "../tools/DOM";
import { findByIdAndRemove } from "../tools/MiscUtils";
import { TokenContextMenu } from "../tools/TokenContextMenu";

class TokenContextMenuApiModule extends R20Module.SimpleBase {
    constructor() {
        super(__filename);

        this.observerCallback = this.observerCallback.bind(this);
    }

    tryInsertMenuWidgets(target) {
        
        if(!target.className) return false;
        if(target.className !== "actions_menu d20contextmenu")  return false;

        const all = TokenContextMenu.getInternalData().widgets;
        const selection = R20.getSelectedTokens();
        
        for(const data of all) 
        {
            if(data.options && data.options.mustHaveSelection && selection.length <= 0)
                continue;
                
            function clicked(e) {
                e.stopPropagation();

                R20.hideTokenRadialMenu(); 
                R20.hideTokenContextMenu();

                data.callback();
            }

            const widget = <li id={data.id} onClick={clicked} class='head hasSub'>{data.text}</li>
            target.firstElementChild.appendChild(widget);
        }
        
        return true;
    }

    observerCallback(muts) {
        for(let e of muts) {
            for(const added of e.addedNodes) {
                if(this.tryInsertMenuWidgets(added)) {
                    return;
                }
            }            
        }
    }

    setup() {
        this.observer = new MutationObserver(this.observerCallback);
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    dispose() {
        const all = TokenContextMenu.getInternalData().widgets;
        for(const data of all) {
            findByIdAndRemove(data.id);
        }

        if(this.observer) this.observer.disconnect();
    }
}

if (R20Module.canInstall()) new TokenContextMenuApiModule().install();

const hook = R20Module.makeHook(__filename, {
    id: "tokenContextMenuApiModule",
    force: true
});

export { hook as TokenContextMenuApiModule }
