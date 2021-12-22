import {R20Module} from "../../utils/R20Module"
import {R20} from '../../utils/R20';
import {promiseWait} from '../../utils/promiseWait';
import {TokenContextMenu} from '../../utils/TokenContextMenu';
import MacroSelectDialog from './MacroSelectDialog';
import {TableOfMacrosByCategoryAndId} from './Types';
import {TOKEN_CONTEXT_MENU_ORDER_ROLL_BULK_MACRO} from '../TokenContextMenuApi/Constants'

class BulkMacroModule extends R20Module.OnAppLoadBase {

  private selectDialog: MacroSelectDialog;

  public constructor() {
    super(__dirname);
  }

  private onDialogClose = async (e) => {
    const macro = this.selectDialog.getData();
    if (!macro) return;

    const tokens = R20.getSelectedTokens();

    const cfg = this.getHook().config;
    const delayBetweenRolls = cfg.delayBetweenRolls;
    const shouldReselect = cfg.reselectAfter;
    const perform_rolls_sequentially = cfg.performRollsSequentially;

    R20.unselectTokens();

    const roll_for_obj = async (obj: Roll20.CanvasObject) => {

      R20.selectToken(obj);

      if(perform_rolls_sequentially) {
        await R20.say_async(macro);
      }
      else {
        R20.say(macro);
      }
    };

    const cleanup = () => {
      R20.hideTokenRadialMenu();
      R20.hideTokenContextMenu();

      if(shouldReselect) {
        for (let obj of tokens) {
          R20.addTokenToSelection(obj);
        }
      }
    };

    if (delayBetweenRolls === 0) {
      for (const obj of tokens) {
        await roll_for_obj(obj);
      }

      cleanup();
    }
    else {
      for (let i = 0; i < tokens.length; i++) {
        await promiseWait(delayBetweenRolls);
        await roll_for_obj(tokens[i]);

        const isLastObj = i + 1 === tokens.length;
        if (isLastObj) {
          cleanup();
        }
      }
    }
  };

  private bulkMacroButtonClicked = (e) => {

    let macros: TableOfMacrosByCategoryAndId = {};

    const addMacro = (macro: Roll20.Macro, category: string) => {
      if (!(category in macros)) macros[category] = {};
      let cat = macros[category][macro.get<string>("id")] = {
        name: macro.get("name"),
        action: macro.get("action")
      };
    };

    const player = R20.getCurrentPlayer();
    const sel = R20.getSelectedTokens();
    console.log(sel);

    for (let macro of player.macros.models) {
      addMacro(macro, "Player Macros");
    }

    const chars = sel
      .reduce((accum, obj) => {
        const model = R20.try_get_canvas_object_model(obj);
        if (!model) {
          accum.uniq++;
          return accum;
        }

        const id: string = model.character
          ? model.character.get("id")
          : model.get("id")
        ;

        if (!(id in accum.map)) {
          accum.uniq++;
          accum.map[id] = true;

          if (model.character) {
            accum.arr.push(model.character);
          }
        }
        return accum;
      }, 
      {map: {}, arr: [], uniq: 0}
    );

    if(chars.uniq === 1 && chars.arr.length > 0) {
      for(let macro of chars.arr[0].abilities.models) {
        addMacro(macro, "Token Macros");
      }
    }

    console.log(macros);
    this.selectDialog.show(macros);
  };

  public setup() {
    if (!R20.isGM()) return;

    this.selectDialog = new MacroSelectDialog();
    this.selectDialog.getRoot().addEventListener("close", this.onDialogClose);

    TokenContextMenu.addButton(
      "Roll Bulk Macro", 
      this.bulkMacroButtonClicked, 
      TOKEN_CONTEXT_MENU_ORDER_ROLL_BULK_MACRO, {
        mustHaveSelection: true
      }
    );
  }

  public dispose() {
    if (this.selectDialog) this.selectDialog.dispose();

    super.dispose();
    TokenContextMenu.removeButton("Roll Bulk Macro", this.bulkMacroButtonClicked)
  }
}

export default () => {
  new BulkMacroModule().install();
};

