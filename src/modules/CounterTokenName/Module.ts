import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";
import { TokenContextMenu } from "../../utils/TokenContextMenu";
import {TOKEN_CONTEXT_MENU_ORDER_NAME_COUNTER} from '../TokenContextMenuApi/Constants'

const ENUMERATE_TOKENS = "Add Counter";

class EnumerateTokensModule extends R20Module.SimpleBase {
  public constructor() {
    super(__dirname);
  }

  private onClickMenuItem = () => {
    const objects = R20.getSelectedTokens();

    // tokens will locally disappear if we do not unselect them here
    R20.unselectTokens();

    let counter = {};
    for (let token of objects) {
      const model = R20.try_get_canvas_object_model(token);
      if(!model) {
        return;
      }

      let originalName = model.character && model.character.attributes.name;
      if (!originalName) {
        originalName = model.attributes.name;
      }

      if (!counter[originalName]) {
        counter[originalName] = 0;
      }

      if (originalName) {
        const save = {name: `${originalName} ${++counter[originalName]}`};
        model.save(save);
      }
    }
  };

  public setup() {
    if(!R20.isGM()) return;

    TokenContextMenu.addButton(ENUMERATE_TOKENS, this.onClickMenuItem, TOKEN_CONTEXT_MENU_ORDER_NAME_COUNTER, {
      mustHaveSelection: true
    });
  }

  public dispose() {
    TokenContextMenu.removeButton(ENUMERATE_TOKENS, this.onClickMenuItem);
  }
}

export default () => {
  new EnumerateTokensModule().install();
};

