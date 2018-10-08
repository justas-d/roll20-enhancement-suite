import { R20Module } from "../../tools/R20Module"
import { R20 } from "../../tools/R20";
import { MacroIO, IApplyableMacroData } from "../../tools/MacroIO";
import { saveAs } from 'save-as'
import {IOModuleCommon} from "../IOModuleCommon";
import {IResult} from "../../tools/Result";

class MacroIOModule extends IOModuleCommon<IApplyableMacroData> {
    constructor() {
        super(__dirname, "r20es-macro-io-widget", "Import/Export Macro", "Select Macros", "r20es-big-dialog");
    }

    protected continueImporting(finalData: IApplyableMacroData[]) {
        MacroIO.applyToPlayer(R20.getCurrentPlayer(), finalData);

        R20.rerenderJournalMacros();
        R20.rerenderMacroBar();
    }

    protected nameGetter(d: IApplyableMacroData): string {
        return d.attributes.name
    }

    protected descGetter(d: IApplyableMacroData): string {
        return d.attributes.action;
    }

    protected getExportData(): IApplyableMacroData[] {
        const player = R20.getCurrentPlayer();
        return MacroIO.prepareMacroList(player);
    }

    protected injectWidget(widget: HTMLElement) {
        const $deckstables = $("#deckstables");
        const root = $deckstables[0].firstElementChild;
        const nextTo = $deckstables.find("#adddeck")[0];

        root.insertBefore(widget, nextTo);
    }

    protected serializeExportData(finalData: IApplyableMacroData[]): { json: string; filename: string } {
        return {
            filename: R20.getCurrentPlayer().attributes.displayname + "_macros.json",
            json: MacroIO.serialize(finalData)
        };
    }

    protected tryDeserialize(data: string): IResult<IApplyableMacroData[], string> {
        return MacroIO.deserialize(data);
    }
}

if (R20Module.canInstall()) new MacroIOModule().install();

