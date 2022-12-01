import { R20Module } from "../../utils/R20Module"
import { createCSSElement, findByIdAndRemove } from "../../utils/MiscUtils";

const constantStyle = `

#page-toolbar .page-create-new-after {
  display: none;
}

#page-toolbar .pages .availablepage .page-duplication {
  display: none;
  top: unset;
  left: unset;
  width: unset;
  margin-top: unset;
  right: 0;
  padding: 10px;
  z-index: 10000;
}

#page-toolbar .pages .availablepage .page-duplication .page-duplication__body .form-group .checkbox {
  width: unset;
}

#page-toolbar .pages .availablepage .page-actions {
  position: unset;
  top: unset;
  right: unset;
  background-color: unset;
  width: unset;
  border-radius: unset;
  border: unset;
  flex-direction: unset;
  justify-content: unset;
  box-shadow: unset;
  padding-right: 8px;
}

#page-toolbar .pages .availablepage span.page-title {
  position: unset;
  bottom: unset;
  width: unset;
  text-align: unset;
  display: unset;
  font-size: unset;
  max-width: unset;
}

#page-toolbar {
  right: unset;
  left: unset;
  max-width: 486px;

  max-height: 80%;
  width: 100%;
  height: 100%;

  background-color: #222;

  border-radius: unset;

  z-index: 10500;
}

#page-toolbar .pages .availablepage span input {
    top: 5px;
    height: 16px;
    width: 90%;
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

#page-toolbar .playerspecificbookmark {
    position: relative;
    order: 4;
    left: 0 !important;
    top: 0 !important;
}

#page-toolbar .playerbookmark.dropping {
    left: 0;
    border: none;
    border: 3px solid yellow;
}

#page-toolbar .playerbookmark {
    position: relative;
    display: inline;
    order: 5;
    left: 0;
    cursor: pointer;
    width: 75px;
    margin-left: 8px;
    height: 30px;
    box-sizing: border-box;
}

#page-toolbar .playerbookmark img {
    transform: rotate(90deg) translateY(-15px) translateX(-25px);
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
    order: 0;
    margin-left: 8px;
    font-size: 1.1em;
    white-space: pre;

    text-align: unset;
    bottom: unset;
    cursor: pointer;

    min-width: 20px;
    min-height: 20px;
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

class AlternativePageToolbarMenu extends R20Module.OnAppLoadBase {

    private static readonly constantSheetId: string = "r20es-alternative-page-toolbar-menu-constant-sheet";
    private static readonly variableSheetId: string = "r20es-alternative-page-toolbar-menu-variable-sheet";
    private static readonly textChangeSelector = "#page-toolbar .pages .availablepage span";

    constructor() {
        super(__dirname);
    }

    private addStyleAsElement(id: string, style: string) {
        const el = createCSSElement(style, id);
        document.body.appendChild(el);
    }

    public onSettingChange(name: string, oldVal: any, newVal: any) {
        this.removeStyle();
        this.addStyle();
    }

    private addStyle() {
        const cfg = this.getHook().config;

        let variableStyle = `
#page-toolbar {
    ${cfg.location === "right"
            ? "right: 440px"
            : "left: 128px"};
    opacity: ${cfg.opacity};
}
`;
        if(cfg.location === "left") {
          variableStyle += `
            #page-toolbar .handle {
              "left: -30px; right: unset !important;"
            }
          `;
        }

        this.addStyleAsElement(AlternativePageToolbarMenu.constantSheetId, constantStyle);
        this.addStyleAsElement(AlternativePageToolbarMenu.variableSheetId, variableStyle);

        console.log("adding style");
    }

    private removeStyle() {
        findByIdAndRemove(AlternativePageToolbarMenu.constantSheetId);
        findByIdAndRemove(AlternativePageToolbarMenu.variableSheetId);
    }

    private updateToolbarTop() {
        const toolbar = document.querySelector("#page-toolbar") as HTMLElement;
        if(toolbar.classList.contains("closed")) {
            toolbar.style.top = `-${toolbar.clientHeight}px`;
        } else {
            toolbar.style.top = "0";
        }
    }

    private originalTextEditHandler: () => void;

    private overrideHandler = (e) => {
        // right-clicks only
        if(e.which !== 3)  return;
        e.stopPropagation();
        e.preventDefault();

        this.originalTextEditHandler.call(e.target);
    };

    private noContextMenu = (e) => false;

    public setup() {
        const clickEvents = $("body").data("events").click;

        if(clickEvents) {

            for(const eventHandler of clickEvents) {
                if(eventHandler.selector === AlternativePageToolbarMenu.textChangeSelector) {
                    this.originalTextEditHandler = eventHandler.handler;
                    break;
                }
            }

            if(!this.originalTextEditHandler) {
                console.error("Failed to find page name text change click event");
            }

        } else {
            console.error("Failed to find 'click' event in the body element.");
        }

        if(this.originalTextEditHandler) {
            $("body").off("click", AlternativePageToolbarMenu.textChangeSelector, this.originalTextEditHandler);
            $("body").on("mousedown", AlternativePageToolbarMenu.textChangeSelector, this.overrideHandler);
            $("body").on("contextmenu", AlternativePageToolbarMenu.textChangeSelector, this.noContextMenu);

            console.log("isntalled new text edit handler");
            console.log(this.originalTextEditHandler)

            //$("body").off("click", textChangeSelector, this.originalTextEditHandler);
        }

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

    private forEachEvent(jqueryEvents: any, fx: (eventType: string, eventCallback: any) => void) {
        for(const eventType in jqueryEvents) {
            const jqueryEvent = jqueryEvents[eventType];

            for(const eventData of jqueryEvent) {
                fx(eventType, eventData.handler);
            }
        }
    }

    public dispose() {
        this.removeStyle();
        this.updateToolbarTop();

        $("body").off("mousedown", AlternativePageToolbarMenu.textChangeSelector, this.overrideHandler);
        $("body").on("click", AlternativePageToolbarMenu.textChangeSelector, this.originalTextEditHandler);
        $("body").off("contextmenu", AlternativePageToolbarMenu.textChangeSelector, this.noContextMenu);

    }
}

export default () => {
  new AlternativePageToolbarMenu().install();
};

