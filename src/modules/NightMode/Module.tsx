import {R20Module} from '../../utils/R20Module'
import {R20} from "../../utils/R20";
import {DOM} from "../../utils/DOM";

class DarkModeModule extends R20Module.OnAppLoadBase {
  constructor() {
    super(__dirname);
  }

  private onPageChanged = () => {
    this.updatePageBackground();
  };

  private updatePageBackground() {
    const cfg = this.getHook().config;

    const page = R20.getCurrentPage();

    let is_default_wrapper = true;
    if(!page.attributes.useAutoWrapper) {
      if(page.attributes.wrapperColor !== "transparent") {
        is_default_wrapper = false;
      }
    }

    let is_default_bg = true;
    if(page.attributes.background_color !== "#ffffff") {
      is_default_bg = false;
    }

    let change_background = true;
    let change_wrapper = true;

    if(cfg.only_force_if_default) {
      change_wrapper = false;
      change_background = false;

      if(is_default_wrapper) {
        change_wrapper = true;
      }
      if(is_default_bg) {
        change_background = true;
      }
    }
  
    if(change_background) {
      const color = cfg.backgroundColor;
      const col = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

      R20.setBackgroundStyle(col);
      R20.renderAll();
    }

    if(change_wrapper) {  
      const color = cfg.backdrop_color;
      const col = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

      $("#editor-wrapper").css("background", col);
      $("body").css("background", col);
    }
  }

  private resetPageBackground() {
    const page = R20.getCurrentPage();

    R20.setBackgroundStyle(page.attributes.background_color);
    page.view.updateWrapperColor();
  }

  public onSettingChange(name, oldVal, newVal) {
    this.updatePageBackground();
  }

  public setup() {
    $(document).on("d20:pagechanged", this.onPageChanged);

    setTimeout(() => {
      this.updatePageBackground();
    }, 500);
  }

  public dispose() {
    super.dispose();
    $(document).off("d20:pagechanged", this.onPageChanged);

    this.resetPageBackground();
    R20.renderAll();
  }
}

export default () => {
  new DarkModeModule().install();
};

