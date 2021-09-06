import {R20Module} from "../../utils/R20Module";
import {DOM} from "../../utils/DOM";
import {findByIdAndRemove, createCSSElement} from "../../utils/MiscUtils";
import SettingsDialog from "./SettingsDialog";
import ButtonId from "./Vars";
import {SettingsSidebarButton} from "../../Components/SettingsSidebarButton";
import {insertButtonIntoSettings} from "../../utils/InsertButtonIntoSettings";

const CSS_ID = "r20es-settings-css";
const CSS = `
.r20es-settings-dialog {
    max-height: 90%;
    max-width: 70%;
    height: 100%;
    width: 100%;
}

.vttes_overwrite_handout  {
  visibility: hidden;
}

.vttes_export_handout {
  visibility: hidden;
}

.r20es-settings-flex-wrapper {
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;
}

.r20es-settings-dialog .dialog-body {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
}

.r20es-settings-dialog .more-settings ul > li {
    display: block;
    margin: 4px 0px 4px 0px
}

.r20es-settings-dialog input,
.r20es-settings-dialog .text {
    vertical-align: middle;
}

.r20es-settings-dialog input[type="checkbox"] {
    margin-right: 4px;
}

.r20es-settings-dialog .more-settings ul > li > select {
    height: auto;
}

.r20es-settings-dialog .more-settings .compact {
    padding: 0;
    margin: 0;
}

.r20es-settings-dialog .more-settings > hr {
    margin-top: 10px;
    margin-bottom: 10px;
}

.r20es-settings-dialog .more-settings > .description {
    margin-bottom: 30px;
}

.r20es-clickable-text {
    width: 100%;
}

.r20es-clickable-text.selected {
    background-color: rgb(220,220,220);
}

.r20es-clickable-text.disabled span {
    color: rgb(200,200,200);
}

.r20es-clickable-text:hover {
    background-color: rgb(245,245,245);
}

.dialog-body > .left {
    white-space: nowrap;
    overflow: auto;
    width: 75%;
    height: 100%;
}

.dialog-body > .right {
    flex-grow: 2;
    overflow: auto;
    width: 100%;
    height: 100%;
}

.r20es-settings-dialog .noconfig {
    display: flex;
    justify-content: center;
    align-items: center;
}

.r20es-settings-dialog .noconfig p {
    font-size: 1.2em;
    font-weight: bold;
}

.r20es-autocomplete {
    position: relative;
}

.r20es-autocomplete .r20es-autocomplete-entries {
    positon: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px;
    background-color: red;
}
`;

class SettingsModule extends R20Module.OnAppLoadBase {
  private dialog: SettingsDialog = null;

  constructor() {
    super(__dirname);
  }

  onButtonClick = (e: any) => {
    e.stopPropagation();
    this.dialog.show();
  };

  setup() {
    this.dialog = new SettingsDialog(this.getAllHooks());

    const el = createCSSElement(CSS, CSS_ID);
    document.head.appendChild(el);

    const button = (
      <SettingsSidebarButton
        text="VTTES Settings"
        id={ButtonId}
        onClick={this.onButtonClick}
      />);

    insertButtonIntoSettings(button);
  }

  dispose() {
    super.dispose();
    findByIdAndRemove(ButtonId);
    findByIdAndRemove(CSS_ID);
    if (this.dialog) this.dialog.dispose();
  }
}

export default () => {
  new SettingsModule().install();
};

