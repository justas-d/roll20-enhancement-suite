import { R20Module } from "../../utils/R20Module"
import { DOM } from '../../utils/DOM'
import Vars from "./Vars";
import {R20} from "../../utils/R20";

class SetTableEntryAvatarByUrl extends R20Module.OnAppLoadBase {

  _observer: MutationObserver;
  _buttonClass = "r20es-set-table-entry-avatar-by-url-button";
  _elementWithIdQuery = `div[${Vars.TABLE_ENTRY_ID_ATTRIBUTE}]`;

  constructor() {
    super(__dirname)
  }
  
  uiOnClickSetByUrl = (e: any) => {
    const idElement = $(e.target).closest(this._elementWithIdQuery)[0];
    if(!idElement) {
      console.error("[SetTableEntryAvatarByUrl] failed to find element with id on set by url event with target", e.target);
      alert("Failed to find the table! Tell a programmer.");
      return;
    }

    const entryId = idElement.getAttribute(Vars.TABLE_ENTRY_ID_ATTRIBUTE);
    const tableId= idElement.getAttribute(Vars.TABLE_ID_ATTRIBUTE);

    const table = R20.getRollableTable(tableId);

    if(!table) {
      alert(`Failed to find a table with id ${table}! Tell a programmer.`);
      return;
    }

    const entry = table.tableitems.get(entryId);
    if(!entry) {
      alert(`Failed to find entry (id: ${entryId}) in table (id: ${entryId}). Tell a programmer.`);
      return;
    }

    const url = prompt("Image URL", entry.attributes.avatar);
    if (!url) {
      return;
    }

    entry.save({
      avatar: url
    });
  };

  uiIsRootElement = (root: HTMLElement) => {
    return root.getAttribute && root.getAttribute(Vars.TABLE_ENTRY_ID_ATTRIBUTE) && $(root).find(`${this._buttonClass}`).length === 0;
  };

  uiAddButtonToRoot = (root: HTMLElement) => {
    const above = $(root).find(".avatar")[0];

    if (!above) {
      console.error("[SetTableEntryAvatarByUrl] failed to find above element of root", root);
      return;
    }

    const button = (<button className={this._buttonClass} style={{marginBottom: "8px"}}>Set Avatar By URL</button>);
    button.addEventListener("click", this.uiOnClickSetByUrl);

    above.parentElement.insertBefore(button, above);
  };

  observerCallback = (mutations: MutationRecord[]) => {
    for(const mut of mutations) {

      mut.addedNodes.forEach(n => {
        if(this.uiIsRootElement(n as HTMLElement)) {
          this.uiAddButtonToRoot(n as HTMLElement);
        }
      });
    }
  };

  setup = () => {
    const query = document.querySelectorAll(this._elementWithIdQuery) as any as HTMLElement[];

    for(const element of query) {
      this.uiAddButtonToRoot(element);
    }

    this._observer = new MutationObserver(this.observerCallback);
    this._observer.observe(document.body, { childList: true, subtree: true });
  };

  dispose = () => {
    this._observer.disconnect();

    const query = document.body.querySelectorAll(`.${this._buttonClass}`) as any as HTMLElement[];

    for(const element of query) {
      element.remove();
    }
  };
}

export default () => {
  new SetTableEntryAvatarByUrl().install();
};

