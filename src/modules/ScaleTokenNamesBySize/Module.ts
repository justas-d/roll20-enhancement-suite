//import {R20Module} from "../../utils/R20Module"
//import {R20} from "../../utils/R20";
//
//interface VueInfo {
//  div: HTMLDivElement;
//  graphic: Roll20.Token;
//};
//
//class ScaleTokenNamesBySizeModule extends R20Module.OnAppLoadBase {
//  public constructor() {
//    super(__dirname);
//  }
//
//  clear_scales = () => {
//    var els = document.body.querySelectorAll("div.nameplate-container .nameplate") as any as Array<HTMLElement>;
//    for(const el of els) {
//      el.style.transform = "";
//    }
//  }
//
//  rerender_scales = () => {
//    var els = document.body.querySelectorAll("div.nameplate-container .nameplate") as any as Array<HTMLElement>;
//    for(const el of els) {
//      // ...
//    }
//  }
//
//  set_scale = (token: Roll20.Token, nameplate_div: HTMLDivElement) => {
//    const scale = this.getScale(token);
//    console.log(scale);
//    nameplate_div.style.transform = `scale(${scale})`;
//  }
//
//
//  private onSettingChange(name: string, oldVal: any, newVal: any) {
//    this.rerender_scales();
//  }
//
//  doNameplateScaling = (data: VueInfo) => {
//    const nameplate_div = data.div.querySelector("div.nameplate") as HTMLDivElement;
//
//    if(typeof(nameplate_div) === "object") {
//      this.set_scale(data.graphic, nameplate_div);
//    }
//  }
//
//  getScale = (token: Roll20.Token) => {
//    const cfg = this.getHook().config;
//    let scale = token.attributes.width / cfg.widthThreshold;
//
//    if (scale < 1 && !cfg.scaleIfSmaller) scale = 1;
//    if (scale > 1 && !cfg.scaleIfLarger) scale = 1;
//
//    return scale;
//  };
//
//  /*
//  private prepNameplateBack = (token: Roll20.CanvasObject, e: CanvasRenderingContext2D) => {
//    try {
//      const cfg = this.getHook().config;
//      let scale = this.getScale(token);
//
//      const scaledFontSize = token._nameplate_data.font_size * scale;
//      e.font = `bold ${scaledFontSize}px Arial`;
//
//      const width = e.measureText(token._nameplate_data.name).width;
//      const t = token.height / 2;
//      const n = e.measureText("M").width;
//
//      token._nameplate_data.position = [-width / 2 - token._nameplate_data.padding, t + token._nameplate_data.vertical_offset];
//      token._nameplate_data.size = [width + 2 * token._nameplate_data.padding, n + 2 * token._nameplate_data.padding];
//    }
//    catch (err) {
//      console.error(err);
//    }
//  };
//
//  private prepNameplateText = (token: Roll20.CanvasObject, e: CanvasRenderingContext2D) => {
//    try {
//      let scale = this.getScale(token) - 1;
//      token._nameplate_data.position[1] += token._nameplate_data.font_size * scale;
//    }
//    catch (err) {
//      console.error(err);
//    }
//  };
//  */
//
//  public setup() {
//    window.r20es.doNameplateScaling = this.doNameplateScaling;
//    this.rerender_scales();
//  }
//
//  public dispose() {
//    window.r20es.doNameplateScaling = undefined;
//    this.clear_scales();
//  }
//}
//
//export default () => {
//  new ScaleTokenNamesBySizeModule().install();
//};
//
