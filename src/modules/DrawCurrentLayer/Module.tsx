import {R20Module} from '../../utils/R20Module'
import {R20} from '../../utils/R20';
import {copy, findByIdAndRemove} from '../../utils/MiscUtils';
import {ILayerInfo, layerInfo } from "../../utils/LayerInfo";
import {DOM} from "../../utils/DOM";

class DrawCurrentLayerModule extends R20Module.OnAppLoadBase {
  private static readonly selectId = "r20es-select";
  private static readonly layerId = "r20es-layer";
  private static readonly rootId = "r20es-drawCurrentLayer-root";

  constructor() {
    super(__dirname);
  }

  private createWidget() {
    const root = document.getElementById("playerzone");
    console.log(root);

    if (!root) return;

    const cfg = this.getHook().config;

    const padCoef = 9.375;
    const bottomPadCoef = 3.75;
    const pad = `${cfg.size / padCoef}px`;

    const divStyle = {
      height: `${cfg.size}px`,
      padding: `${pad} ${pad} ${cfg.size / bottomPadCoef}px ${pad}`,
    }

    const textStyle = {
      fontFamily: "Helvetica",
      fontSize: `${cfg.size}px`,
      //lineHeight: "0.67em",
      lineHeight: "1em",
      color: `rgba(${cfg.textFillColor[0]}, ${cfg.textFillColor[1]}, ${cfg.textFillColor[2]}, ${cfg.textFillOpacity})`,
      textShadow: `2px 2px 0px rgba(${cfg.textOutlineColor[0]}, ${cfg.textOutlineColor[1]}, ${cfg.textOutlineColor[2]}, ${cfg.textOutlineOpacity})`
    }

    let rootStyle: any = {
      opacity: cfg.globalOpacity,
      marginBottom: "15px",
      marginRight: "15px",
      position: "absolute",
    };

    switch (cfg.corner) {
      case ("bottomRight"): {
        rootStyle.bottom = "0";
        rootStyle.right = "0";
        break;
      }
      case ("bottomLeft"): {
        rootStyle.bottom = "0";
        rootStyle.left = "0";
        break;
      }
      case ("topRight"): {
        rootStyle.top = "0";
        rootStyle.right = "0";
        break;
      }
      case ("topLeft"): {
        rootStyle.top = "0";
        rootStyle.left = "0";
        break;
      }
      default: {
        console.error(`Unknown DCL module corner: ${cfg.corner}`);
      }
    }

    const widget = (
      <div id={DrawCurrentLayerModule.rootId} style={rootStyle}>

        {cfg.showNotSelecting &&
          <div id={DrawCurrentLayerModule.selectId}
             style={copy(divStyle, {background: `rgba(255,0,0,${cfg.notSelectingOpacity})`})}>
            <p style={textStyle}>Not selecting!</p>
          </div>
        }

        <div id={DrawCurrentLayerModule.layerId} style={divStyle}>
          <p style={textStyle}></p>
        </div>
      </div>
    );

    root.appendChild(widget);

    this.render(layerInfo[R20.getCurrentLayer()]);
    this.updateModeIndicator(R20.getCurrentToolName());
  }

  private removeWidget() {
    findByIdAndRemove(DrawCurrentLayerModule.rootId);
  }

  public onSettingChange(name, oldVal, newVal) {
    this.removeWidget();
    this.createWidget();
  }

  public setup() {
    if (!R20.isGM()) return;

    this.createWidget();
   
    window.r20es.setModePrologue = this.updateModeIndicator;
    window.r20es.update_layer_indicator = this.update_layer_indicator;
  }

  update_layer_indicator = (new_layer: string) => {
    for (const key in layerInfo) {
      const layer = layerInfo[key];

      if(new_layer != key) continue;

      this.render(layer);
      break;
    }
  };

  private updateModeIndicator = (mode: string) => {
    //console.log(`new mode: ${mode}`);

    const div = document.getElementById(DrawCurrentLayerModule.selectId);
    if (!div) {
      return;
    }

    div.style.display = (mode === "select" ? "none" : "block");
  };

  private render = (layer: ILayerInfo) => {
    const div = document.getElementById(DrawCurrentLayerModule.layerId);
    const text = $(div).find("p")[0];

    div.style.backgroundColor = `rgba(${layer.bgColors[0]}, ${layer.bgColors[1]}, ${layer.bgColors[2]}, ${this.getHook().config.backgroundOpacity})`;
    text.innerHTML = layer.bigTxt;
  };

  public dispose() {
    super.dispose();

    window.r20es.setModePrologue = null;
    window.r20es.update_layer_indicator = null;

    this.removeWidget();
  }
}

export default () => {
  new DrawCurrentLayerModule().install();
};

