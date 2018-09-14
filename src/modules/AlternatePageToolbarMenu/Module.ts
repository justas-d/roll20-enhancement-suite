import { R20Module } from "../../tools/R20Module"
import { createCSSElement, findByIdAndRemove } from "../../tools/MiscUtils";

class AlternativePageToolbarMenu extends R20Module.OnAppLoadBase {

    readonly sheetId: string = "r20es-alternative-page-toolbar-menu-sheet";

    constructor() {
        super(__dirname);
    }

    onSettingChange(name: string, oldVal: any, newVal: any) {
        this.removeStyle();
        this.addStyle();
    }

    addStyle() {
        const cfg = this.getHook().config;
        let style = `
#page-toolbar {
    right: unset;
    left: unset;
    ${cfg.location === "right"
            ? "right: 400px"
            : "left: 128px"};
    max-width: 486px;
    
    max-height: 90%;
    width: 100%;
    height: 100%;
    
    opacity: ${cfg.opacity};
    background-color: #222;
    
    border-radius: unset;
}

#page-toolbar .activepage {
    background-color: rgb(47, 135, 209) !important;
}

#page-toolbar .pages .availablepage img.pagethumb {
    width: 32px;
    height: 32px;
    order: 0;
    margin-top: 0;
    cursor: pointer;
    
    box-shadow: unset;
    max-width: unset;
    max-height: unset;
    background-color: unset;
}

#page-toolbar .pages .availablepage .duplicate {
    display: inline;
    position: relative;
    order: 1;
    margin-left: 8px;
    right: unset;
    top: unset;
    cursor: pointer;
}

#page-toolbar .pages .availablepage .settings {
    position: relative;
    display: inline;
    order: 2;
    margin-left: 8px;
    cursor: pointer;
    
    top: unset;
    left: unset;
    font-size: 20px;
    background-color: unset;
    padding: 0;
    border-radius: 0
    
}

#page-toolbar .playerbookmark {    
    position: relative;
    display: inline;
    order: 4;
    left: 0;
    width: auto;
    flex: 1;
    cursor: pointer;    
}

#page-toolbar .playerbookmark img {
    transform: rotate(90deg) translateY(20px);
}

#page-toolbar .pages .availablepage {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;

    text-align: unset;
    margin-right: unset;
    margin-top: unset;
    position: unset;
    cursor: unset;
    vertical-align: unset;
}

#page-toolbar .pages .availablepage:nth-child(even) {
    background-color: #333;
}

#page-toolbar .pages .availablepage span {
    position: relative;
    display: inline;
    max-width: unset;
    width: auto;
    flex: 10;
    order: 3;
    margin-left: 8px;
    font-size: 1.1em;
    white-space: pre;
    
    
    text-align: unset;
    bottom:unset;
    cursor: pointer;
}

#page-toolbar .handle {
    
    ${cfg.location === "right"
            ? "right: -30px !important; left: unset;"
            : "left: -30px; right: unset !important;"};
}

div#page-toolbar:not(.closed) > div.handle.showtip {
    top: -3px;
    bottom: unset !important;
}


#page-toolbar .activepage img.pagethumb {
    border: none;
}

#page-toolbar .availablepage:hover {
    background-color: rgba(47, 135, 209, 0.2) !important;
}

#page-toolbar .pages div.availablepage:hover img.pagethumb {
    filter: contrast(120%);
    box-shadow: unset;
}

#page-toolbar .ui-sortable {
    display: flex !important;
    flex-direction: column;
    height: auto;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    
    padding-bottom: 32px;
}
    
#page-toolbar .container {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    padding: 0;
    margin: 0;
  
    white-space: unset;
    
}

`;
        const el = createCSSElement(style, this.sheetId);
        document.body.appendChild(el);

        console.log("adding style");
    }

    removeStyle() {
        findByIdAndRemove(this.sheetId);
    }

    private updateToolbarTop() {
        const toolbar = document.querySelector("#page-toolbar") as HTMLElement;
        if(toolbar.classList.contains("closed")) {
            toolbar.style.top = `-${toolbar.clientHeight}px`;
        } else {
            toolbar.style.top = "0";
        }
    }

    setup() {
        this.addStyle();
        this.updateToolbarTop();

        // Note(Justas): betteR20 modifies the page toolbar menu too
        // including the top value on the #page-toolbar element.
        // That new top value makes the alternative menu kinda jut out of hiding
        // when it's supposed to be fully hidden.
        // Recalling updateToolbarTop after 1000ms fixes this.
        setTimeout(() => {
            this.updateToolbarTop();
        }, 1000);
    }

    dispose() {
        this.removeStyle();
        this.updateToolbarTop();
    }
}

if (R20Module.canInstall()) new AlternativePageToolbarMenu().install();
