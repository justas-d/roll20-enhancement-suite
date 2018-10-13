import { R20Module } from "../../utils/R20Module"
import { createCSSElement, findByIdAndRemove } from "../../utils/MiscUtils";
const constantStyle = require("./alternativePageToolbar.scss");

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
            ? "right: 400px"
            : "left: 128px"};
    opacity: ${cfg.opacity};
}

#page-toolbar .handle {
    ${cfg.location === "right"
            ? "right: -30px !important; left: unset;"
            : "left: -30px; right: unset !important;"};
}
`;

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

        /*
        const $toolbar = this.getEventToolbarRoot();
        this.oldToolbarEvents = $toolbar.data("events");

        this.forEachEvent(this.oldToolbarEvents, (type, cb) => {
            $toolbar.off(type, cb);
        });
        */

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

        /*
        // reattach original events
        const $toolbar = this.getEventToolbarRoot();
        this.forEachEvent(this.oldToolbarEvents, (type, cb) => {
            $toolbar.on(type, cb);
        });
        */
    }
}

if (R20Module.canInstall()) new AlternativePageToolbarMenu().install();

(function() {
    const style = document.createElement("style")
    style.innerText = `#page-toolbar .pages .availablepage span {
    min-width: 20px;
    min-height: 20px;
}`;
    document.head.appendChild(style);
})();
