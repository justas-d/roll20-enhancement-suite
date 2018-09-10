import { R20Module } from "../../tools/R20Module";
import { DOM } from "../../tools/DOM";
import { findByIdAndRemove } from "../../tools/MiscUtils";
import PickObjectsDialog from "../PickObjectsDialog";
import { Macro } from "roll20";
import { R20 } from "../../tools/R20";

class QuickRemoveModule extends R20Module.OnAppLoadModule {
    
    private static readonly widgetClass: string = "r20es-quick-remove-widget";
    private pickObjectsDialog: PickObjectsDialog<any>;
    private continueCallback: () => void;

    private abilityNameGetter = (d: any) => (d as Macro).attributes.name;
    private abilityDescGetter = (d: any) => (d as Macro).attributes.action;
    
    private createWidgets() {
        console.log("Enter create widget");
        const createWidget = (clickFx: (e: any) => void) => (
            <div className={QuickRemoveModule.widgetClass}>
                <button onClick={clickFx}>
                    Quick Remove 
                </button>
            </div>
        );

        // TODO : inject this into the macros tab on the char sheet?
        
        /*const abilityWidget = createWidget(e => {
            
        })
        ;*/

        const macroWidget = createWidget(e => {
            const macros = R20.getCurrentPlayer().macros.models;
            
            this.pickObjectsDialog.show("Delete Macros", 
                macros, 
                this.abilityNameGetter, 
                this.abilityDescGetter,
                this.continueRemoveMacros);
        });


        console.log("Created macro widget");

        const root = $("#deckstables")[0].firstElementChild;
        const nextTo = $("#deckstables").find("#adddeck")[0];
        console.log(root);
        console.log("Adding macro widget");

        root.insertBefore(macroWidget, nextTo);
        console.log(macroWidget);
    }

    private continueRemoveMacros(macros: Macro[]) {
        // TODO : check if macros have a remove function
//        macros.forEach(m => m.remove());
    }

    setup() {
        console.log("======================================= SETUP");
        this.pickObjectsDialog = new PickObjectsDialog(); 
        this.createWidgets();
    }

    dispose() {
        const widgets = document.querySelectorAll(`.${QuickRemoveModule.widgetClass}`);
        let idx = widgets.length;
        while(idx --> 0) {
            widgets[idx].remove();
        }
    }
}
