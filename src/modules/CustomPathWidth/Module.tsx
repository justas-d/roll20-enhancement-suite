import {R20Module} from '../../utils/R20Module'
import { DOM } from '../../utils/DOM'
import { R20 } from "../../utils/R20";

const BUTTON_CLASS = "vttes-character-image-from-url";

class CustomPathWidth extends R20Module.OnAppLoadBase {

  opt: HTMLOptionElement;
  size_el: HTMLElement;

  constructor() {
    super(__dirname);
  }
  
  on_size_el_change = (e) => {
    const input = e.target as HTMLInputElement;
    this.opt.value = input.value;
    this.opt.innerText = `Custom (${input.value})`;

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

  either_show_or_hide_custom_size_input = (select: HTMLSelectElement) => {
    const option = select.selectedOptions[0];

    if(option.innerText.startsWith("Custom")) {
      this.size_el.style.removeProperty("display");
    }
    else {
      this.size_el.style.display = "none";
    }

  }

  on_change_select = (e) => {
    const select = e.target as HTMLSelectElement;
    this.either_show_or_hide_custom_size_input(select);
  }

  try_get_select_element = (): HTMLSelectElement => {
    const select = document.querySelector("#path_width");
    if(!select) {
      console.error("Could not find the path_width element");
      return null;
    }
    return select as HTMLSelectElement;
  }

  on_shape_selected = (e, t) => {

    const select = this.try_get_select_element();
    if(select) {
      this.either_show_or_hide_custom_size_input(select);
    }
  }

  setup() {
    const select = this.try_get_select_element();
    if(!select) return;

    {
      this.opt = (<option value="20">Custom (20)</option>);

      select.insertBefore(this.opt, select.firstChild);
      select.addEventListener("change", this.on_change_select);
    }

    {
      const root = select.parentElement.parentElement;
      this.size_el = (
        <li style={{display: "none"}}>
          <span style={{
            fontSize: "0.65em",
            marginRight: "4px"
          }}>
            Size:
          </span>
          <input value="20" onchange={this.on_size_el_change} type="number"></input>
        </li>
      );
      root.appendChild(this.size_el);
    }

    $("body").on("shape_selected", "#editor", this.on_shape_selected);
  }

  dispose() {
    if(this.opt) this.opt.remove();
    if(this.size_el) this.size_el.remove();

    const select = this.try_get_select_element();
    if(select) {
      select.removeEventListener("change", this.on_change_select);
    }

    $("body").off("shape_selected", "#editor", this.on_shape_selected);

    super.dispose();
  }
}

export default () => {
  new CustomPathWidth().install();
};

