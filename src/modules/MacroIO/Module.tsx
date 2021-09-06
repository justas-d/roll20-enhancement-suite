import {R20Module} from "../../utils/R20Module"
import {R20} from "../../utils/R20";
import {IApplyableMacroData, MacroIO} from "../../utils/MacroIO";
import {IOModuleCommon} from "../IOModuleCommon";
import {IResult} from "../../utils/Result";
import {ImportStrategy} from "../ImportStrategy";
import { DOM } from "../../utils/DOM";

class MacroIOModule extends IOModuleCommon<IApplyableMacroData> {
  constructor() {
    super(
      __dirname, 
      "r20es-macro-io-widget", 
      "Import/Export Macro", 
      "Select Macros", 
      "Macro", 
      "r20es-big-dialog"
    );
  }

  import_strategy: ImportStrategy = ImportStrategy.ADD;

  continueImporting = (finalData: IApplyableMacroData[]) => {
    MacroIO.applyToPlayer(R20.getCurrentPlayer(), finalData, this.import_strategy);

    R20.rerenderJournalMacros();
    R20.rerenderMacroBar();
  }

  nameGetter(d: IApplyableMacroData): string {
    return d.attributes.name
  }

  descGetter(d: IApplyableMacroData): string {
    return d.attributes.action;
  }

  updateStrategy = (e: any) => {
    e.stopPropagation();
    this.import_strategy = e.target.value;
  }

  extra_drawing_above_table_import(): HTMLElement {
    return (
      <span>On duplicate name in import:
          <select value={this.import_strategy} onChange={this.updateStrategy}>
            <option value={ImportStrategy.ADD}>Add the duplicate</option>
            <option value={ImportStrategy.UPDATE_FIRST_MATCH}>Update first existing macro with matching name</option>
        </select>
      </span>
    );
  }

  getExportData(): IApplyableMacroData[] {
    const player = R20.getCurrentPlayer();
    return MacroIO.prepareMacroList(player);
  }

  injectWidget(widget: HTMLElement) {
    const $deckstables = $("#deckstables");
    const root = $deckstables[0].firstElementChild;
    const nextTo = $deckstables.find("#adddeck")[0];

    root.insertBefore(widget, nextTo);
  }

  serializeExportData(finalData: IApplyableMacroData[]): { json: string; filename: string } {
    return {
      filename: R20.getCurrentPlayer().attributes.displayname + "_macros.json",
      json: MacroIO.serialize(finalData)
    };
  }

  tryDeserialize(data: string): IResult<IApplyableMacroData[], string> {
    return MacroIO.deserialize(data);
  }
}

export default () => {
  new MacroIOModule().install();
};

