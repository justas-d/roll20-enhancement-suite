import {R20Module} from "../../utils/R20Module";
import { createCSSElement, findByIdAndRemove } from "../../utils/MiscUtils";

const CSS_ELEMENT_ID = "vttes_hide_tipsy_popup";

const CSS_STYLE = `
.tipsy-inner {
  visibility:hidden;
}
`;

class HideTipsyPopup extends R20Module.SimpleBase {
  constructor() {
    super(__dirname);
  }

  setup() {
    const el = createCSSElement(CSS_STYLE, CSS_ELEMENT_ID);
    document.body.appendChild(el);
  }

  dispose() {
    findByIdAndRemove(CSS_ELEMENT_ID);
  }
}

if (R20Module.canInstall()) new HideTipsyPopup().install();
