import {R20Module} from '../../utils/R20Module'
import { DOM } from '../../utils/DOM'
import { R20 } from "../../utils/R20";

class CustomPathWidth extends R20Module.OnAppLoadBase {

  observer: MutationObserver;

  constructor() {
    super(__dirname);
  }
  
  on_size_el_change = (e) => {
    const input = e.target as HTMLInputElement;

    const val_number = parseInt(input.value, 10);

    R20.set_drawing_brush_size(val_number);

    const selected_tokens = R20.getSelectedTokens();
    for(const token of selected_tokens) {
      if(token.type != "path") continue;

      // @ts-ignore
      token.set("strokeWidth", val_number);

      // @ts-ignore
      window.d20.engine.canvas.fire("object:modified", { target: token })
    }
  }

  observer_callback = (muts) => {

    for(let e of muts) {
      for(const added of e.addedNodes) {
        if(added.id === "draw-options-outer") {

          var size_el = (
            <li>
              <span style={{
                marginRight: "4px"
              }}>
                (or) Custom size:
              </span>
              <input value="20" onchange={this.on_size_el_change} type="number"></input>
            </li>
          );

          added.appendChild(size_el);
        }
      }
    }
  };

  setup() {
    this.observer = new MutationObserver(this.observer_callback);
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  dispose() {
    if(this.observer) {
      this.observer.disconnect();
    }

    super.dispose();
  }
}

export default () => {
  new CustomPathWidth().install();
};

