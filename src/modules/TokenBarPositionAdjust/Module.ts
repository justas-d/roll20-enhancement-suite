import {R20Module} from "../../utils/R20Module";
import {R20} from "../../utils/R20";

interface StatusIconData {
  color: any;
  dead: any;
  icon: number;
  number: any
}

interface StatusIconDrawCommand {
  color_radius: number;
  font_size: number;
  full_size: number[];
  icon_size: number[];
  offset: number[];
  padded_icon_size: number[];
  padding: number;
  position: number[];
  side: "right" | "bottom" | "top" | "left"
  stroke_width: number;
  vertical: boolean;
}

class TokenBarPositionAdjust  extends R20Module.SimpleBase {
  constructor() {
    super(__dirname);
  }

  statusDraw = (ctx: CanvasRenderingContext2D, graphic: Roll20.CanvasObject, status_icons: StatusIconData[], draw_command :StatusIconDrawCommand) => {
    try {
      const config = this.getHook().config;

      // @ts-ignore
      graphic._positionAndScaleStatusIcons(draw_command , status_icons.length);
      ctx.save();

      if(config.active_status_icon_opacity !== 1.0 || config.idle_status_icon_opacity !== 1.0) {
        const is_selected = R20.getSelectedTokens().find(e => e === graphic);

        ctx.globalAlpha = is_selected
          ? config.active_status_icon_opacity
          : config.idle_status_icon_opacity
        ;
      }

      if(config.position_status_icons_outside_the_token) {
        switch (draw_command.side) {
          case "bottom":
            if (draw_command.position) {
              draw_command.position[1] += draw_command.icon_size[1] * 2.5;
            }
            break;
          case "left":
            if (draw_command.position) {
              draw_command.position[0] -= draw_command.icon_size[0];
            }
            break;
          case "right":
            if (draw_command.position) {
              draw_command.position[0] += draw_command.icon_size[0];
            }
            break;
          case "top":
            if (draw_command.position) {
              draw_command.position[1] = -(graphic.height * 0.5 + draw_command.icon_size[1]);
            }
            break;
          default:
            console.error("[TokenBarPositionAdjust] unknown draw_command.side", draw_command);
        }
      }
    }
    catch(err) {
      console.error(err);
    }

    return true;
  };

  onSettingChange(name, oldVal, newVal) {
    R20.renderAll();
  }

  setup() {
    window.r20es["statusDraw"] = this.statusDraw;

    R20.renderAll();
  }

  dispose() {
    window.r20es["statusDraw"] = null;
    R20.renderAll();
  }
}

export default () => {
  new TokenBarPositionAdjust().install();
};

