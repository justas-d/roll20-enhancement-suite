import {R20Module} from '../../utils/R20Module'
import {R20} from "../../utils/R20";
import {DOM} from "../../utils/DOM";
import * as CONSTS from "./Constants";

interface Render_Info {
  to_x: number;
  to_y: number;
  x: number;
  y: number;
  vttes_radius_mode: number;
  vttes_box_mode: number;
  vttes_cone_mode: number;
  vttes_cone_degrees: number;
  vttes_line_mode: number;
  vttes_line_width: number;
  vttes_ruler_mode: number;
};

class ExtraRulers extends R20Module.OnAppLoadBase {
  constructor() {
    super(__dirname);
  }

  ruler_ui_el: HTMLElement;
  radius_el: HTMLElement;
  box_el: HTMLElement;
  cone_el: HTMLElement;
  line_el: HTMLElement;
  select_el: HTMLSelectElement;

  render_rulers = (e: CanvasRenderingContext2D, t: Render_Info) => {
    try {
      if(t.vttes_ruler_mode == CONSTS.RULER_RADIUS) {
        if(t.vttes_radius_mode == CONSTS.RADIUS_MODE_BLAST) {
          const dx = t.to_x - t.x;
          const dy = t.to_y - t.y;
          const len = Math.sqrt(dx*dx+dy*dy);

          e.beginPath();
          e.arc(t.x + dx*.5, t.y+dy*.5, len*.5, 0, 6.28);
          e.stroke();
        }
        else { /* aka RADIUS_MODE_BURST */ 
          const dx = t.to_x - t.x;
          const dy = t.to_y - t.y;
          const len = Math.sqrt(dx*dx+dy*dy);

          e.beginPath();
          e.arc(t.x, t.y, len, 0, 6.28);
          e.stroke();
        }
      }
      else if(t.vttes_ruler_mode == CONSTS.RULER_CONE) {
        if(t.vttes_cone_mode == CONSTS.CONE_MODE_ROUNDED) {
          const angle = t.vttes_cone_degrees * (Math.PI/180.0);
          const dx = t.to_x - t.x;
          const dy = t.to_y - t.y;
          const len = Math.sqrt(dx*dx+dy*dy);
          const ruler_angle = Math.atan2(dy,dx);

          if(len > 1e-6) {
            const dirx = dx/len;
            const diry = dy/len;

            const top_cos = Math.cos(angle*.5);
            const top_sin = Math.sin(angle*.5);

            const topx = (dirx * top_cos - diry * top_sin) * len + t.x;
            const topy = (dirx * top_sin + diry * top_cos) * len + t.y;

            const bot_cos = Math.cos(-angle*.5);
            const bot_sin = Math.sin(-angle*.5);

            const botx = (dirx * bot_cos - diry * bot_sin) * len + t.x;
            const boty = (dirx * bot_sin + diry * bot_cos) * len + t.y;

            e.beginPath();
            e.moveTo(t.x, t.y);
            e.lineTo(topx, topy);

            e.moveTo(t.x, t.y);
            e.lineTo(botx, boty);
            e.stroke();

            e.arc(t.x, t.y, len, ruler_angle - angle * .5, ruler_angle + angle * .5);
            e.stroke();
          }
        }
        else { /* aka CONE_MODE_FLAT */
          const dx = t.to_x - t.x;
          const dy = t.to_y - t.y;
          const offx = -dy*.5;
          const offy =  dx*.5;

          e.beginPath();
          e.moveTo(t.x, t.y);
          e.lineTo(t.x + offx + dx, t.y + offy + dy);
          e.lineTo(t.x - offx + dx, t.y - offy + dy);
          e.closePath();

          e.stroke();
        }
      }
      else if(t.vttes_ruler_mode == CONSTS.RULER_BOX) {
        if(t.vttes_box_mode == CONSTS.BOX_MODE_BLAST) {
          e.beginPath();

          const dx = t.to_x - t.x;
          const dy = t.to_y - t.y;
          const offx = -dy * .5;
          const offy =  dx * .5;

          e.moveTo(t.x - offx, t.y - offy);
          e.lineTo(t.x + offx, t.y + offy);
          e.lineTo(t.x + offx + dx, t.y + offy + dy);
          e.lineTo(t.x - offx + dx, t.y - offy + dy);
          e.closePath();

          e.stroke();
        }
        else { /* aka BOX_MODE_BURST */
          e.beginPath();

          const dx = t.to_x - t.x;
          const dy = t.to_y - t.y;
          const offx = -dy;
          const offy =  dx;

          e.moveTo(t.x - offx - dx, t.y - offy - dy);
          e.lineTo(t.x - offx + dx, t.y - offy + dy);
          e.lineTo(t.x + offx + dx, t.y + offy + dy);
          e.lineTo(t.x + offx - dx, t.y + offy - dy);
          e.closePath();

          e.stroke();
        }
      }
      else if(t.vttes_ruler_mode == CONSTS.RULER_LINE) {
        let width = t.vttes_line_width;

        if(t.vttes_line_mode == CONSTS.LINE_MODE_WIDTH_TO_EDGE) {
          // nop 
        }
        else { /* aka LINE_MODE_TOTAL_WIDTH */
          width *= .5;
        }

        const width_scale = window.d20.Campaign.activePage().get("scale_number") as number;
        width = (width / width_scale) * 70;

        const dx = t.to_x - t.x;
        const dy = t.to_y - t.y;
        const len = Math.sqrt(dx*dx+dy*dy);

        if(len > 1e-6) {
          // NOTE(justasd): aka the up vector
          const normalx = -dy/len;
          const normaly = dx/len;

          const upx = normalx * width;
          const upy = normaly * width;

          e.beginPath();

          e.moveTo(t.x+upx, t.y+upy); // tl
          e.lineTo(t.x-upx, t.y-upy); // bl
          e.lineTo(t.x+dx-upx, t.y+dy-upy); // br
          e.lineTo(t.x+dx+upx, t.y+dy+upy); // tr
          e.closePath();

          e.stroke();
        }
      }
    }
    catch(ex) {
      console.error("render_rulers had an error:", ex);
    }
  }

  redraw_ruler_config_display = () => {
    let show_radius = false;
    let show_box = false;
    let show_cone = false;
    let show_line = false;

    if(window.r20es.extra_ruler.ruler_mode == CONSTS.RULER_RADIUS) {
      show_radius = true;
    }
    else if(window.r20es.extra_ruler.ruler_mode == CONSTS.RULER_CONE) {
      show_cone = true;
    }
    else if(window.r20es.extra_ruler.ruler_mode == CONSTS.RULER_BOX) {
      show_box = true;
    }
    else if(window.r20es.extra_ruler.ruler_mode == CONSTS.RULER_LINE) {
      show_line = true;
    }

    if(show_radius) this.radius_el.style.display = "inline";
    else this.radius_el.style.display = "none";

    if(show_box) this.box_el.style.display = "inline";
    else this.box_el.style.display = "none";

    if(show_cone) this.cone_el.style.display = "inline";
    else this.cone_el.style.display = "none";

    if(show_line) this.line_el.style.display = "inline";
    else this.line_el.style.display = "none";
  }

  set_new_ruler_mode = (new_mode: number) => {
    this.setConfigValue("ruler_mode", new_mode);
    window.r20es.extra_ruler.ruler_mode = new_mode;
    this.redraw_ruler_config_display();
  }

  hotkey_ruler_normal = () => {
    R20.enter_measure_mode();
    this.select_el.selectedIndex = CONSTS.RULER_NORMAL;
    this.set_new_ruler_mode(CONSTS.RULER_NORMAL);
    return false;
  }

  hotkey_ruler_radius = () => {
    R20.enter_measure_mode();
    this.select_el.selectedIndex = CONSTS.RULER_RADIUS;
    this.set_new_ruler_mode(CONSTS.RULER_RADIUS);
    return false;
  }

  hotkey_ruler_cone = () => {
    R20.enter_measure_mode();
    this.select_el.selectedIndex = CONSTS.RULER_CONE;
    this.set_new_ruler_mode(CONSTS.RULER_CONE);
    return false;
  }

  hotkey_ruler_box = () => {
    R20.enter_measure_mode();
    this.select_el.selectedIndex = CONSTS.RULER_BOX;
    this.set_new_ruler_mode(CONSTS.RULER_BOX);
    return false;
  }

  hotkey_ruler_line = () => {
    R20.enter_measure_mode();
    this.select_el.selectedIndex = CONSTS.RULER_LINE;
    this.set_new_ruler_mode(CONSTS.RULER_LINE);
    return false;
  }

  setup = () => {
    // @ts-ignore
    window.r20es.extra_ruler = {};

    window.r20es.extra_ruler_set_mode = (e) => {
      if(e === "measure") {
        this.ruler_ui_el.style.display = "block";
      }
      else {
        this.ruler_ui_el.style.display = "none";
      }
    };

    {
      const config = this.getHook().config;
      window.r20es.extra_ruler.radius_mode = config.radius_mode;
      window.r20es.extra_ruler.box_mode = config.box_mode;
      window.r20es.extra_ruler.cone_mode = config.cone_mode;
      window.r20es.extra_ruler.cone_degrees = config.cone_degrees;
      window.r20es.extra_ruler.line_mode = config.line_mode;
      window.r20es.extra_ruler.line_width = config.line_width;
      window.r20es.extra_ruler.ruler_mode = config.ruler_mode;
    }
    
    window.r20es.render_extra_rulers = this.render_rulers;

    // TODO(justasd): set default select, input values

    const radius_mode_select_change = e => {
      const el = e.target as HTMLSelectElement;
      const val = parseInt(el.value, 10);
      this.setConfigValue("radius_mode", val);
      window.r20es.extra_ruler.radius_mode = val;
    };
    this.radius_el = (
      <div style={{marginLeft: "8px", display: "none"}}>
        <select 
          selectedIndex={window.r20es.extra_ruler.radius_mode}
          style={{width: "80px", margin: "0"}} 
          onchange={radius_mode_select_change}
        >
          <option value={CONSTS.RADIUS_MODE_BURST}>Burst</option>
          <option value={CONSTS.RADIUS_MODE_BLAST}>Blast</option>
        </select>
      </div>
    );

    const box_mode_select_change = e => {
      const el = e.target as HTMLSelectElement;
      const val = parseInt(el.value, 10);
      this.setConfigValue("box_mode", val);
      window.r20es.extra_ruler.box_mode = val;
    };
    this.box_el = (
      <div style={{marginLeft: "8px", display: "none"}}>
        <select 
          selectedIndex={window.r20es.extra_ruler.box_mode}
          style={{width: "80px", margin: "0"}} 
          onchange={box_mode_select_change}
        >
          <option value={CONSTS.BOX_MODE_BURST}>Burst</option>
          <option value={CONSTS.BOX_MODE_BLAST}>Blast</option>
        </select>
      </div>
    );

    const cone_mode_select_change = e => {
      const el = e.target as HTMLSelectElement;
      const val = parseInt(el.value, 10);
      this.setConfigValue("cone_mode", val);
      window.r20es.extra_ruler.cone_mode = val;
    };
    const cone_degrees_change = e => {
      const el = e.target as HTMLInputElement;
      const val = parseInt(el.value, 10);
      this.setConfigValue("cone_degrees", val);
      window.r20es.extra_ruler.cone_degrees = val;
    };
    this.cone_el = (
      <div style={{marginLeft: "8px", display: "none"}}>

        <input 
          value={window.r20es.extra_ruler.cone_degrees} 
          type="number" 
          style={{width: "64px", margin: "0"}}
          onchange={cone_degrees_change}
        />
        <span style={{marginLeft: "2px"}}>degrees</span>

        <select 
          selectedIndex={window.r20es.extra_ruler.cone_mode}
          style={{width: "100px", margin: "0", marginLeft: "8px"}} 
          onchange={cone_mode_select_change}
        >
          <option value={CONSTS.CONE_MODE_FLAT}>Flat</option>
          <option value={CONSTS.CONE_MODE_ROUNDED}>Rounded</option>
        </select>
      </div>
    );

    const line_mode_select_change = e => {
      const el = e.target as HTMLSelectElement;
      const val = parseInt(el.value, 10);
      this.setConfigValue("line_mode", val);
      window.r20es.extra_ruler.line_mode = val;
    };
    const line_width_change = e => {
      const el = e.target as HTMLInputElement;
      const val = parseInt(el.value, 10);
      this.setConfigValue("line_width", val);
      window.r20es.extra_ruler.line_width = val;
    };
    this.line_el = (
      <div style={{marginLeft: "8px", display: "none"}}>
        <select 
          selectedIndex={window.r20es.extra_ruler.line_mode}
          style={{width: "120px", margin: "0"}} 
          onchange={line_mode_select_change}
        >
          <option value={CONSTS.LINE_MODE_TOTAL_WIDTH}>Total Width</option>
          <option value={CONSTS.LINE_MODE_WIDTH_TO_EDGE}>Width to Edge</option>
        </select>

        <input 
          value={window.r20es.extra_ruler.line_width} 
          type="number" 
          style={{width: "64px", margin: "0", marginLeft: "8px"}}
          onchange={line_width_change}
        />

        <span style={{marginLeft: "2px", marginRight: "8px"}}>units</span>
      </div>
    );

    const ruler_mode_select_change = (e) => {
      const el = e.target as HTMLSelectElement;
      const val = parseInt(el.value, 10);

      this.set_new_ruler_mode(val);
    };

    this.select_el = (
      <select 
        selectedIndex={window.r20es.extra_ruler.ruler_mode}
        style={{width: "80px", margin: "0"}} 
        onchange={ruler_mode_select_change}
      >
        <option value={CONSTS.RULER_NORMAL}>Ruler</option>
        <option value={CONSTS.RULER_RADIUS}>Radius</option>
        <option value={CONSTS.RULER_CONE}>Cone</option>
        <option value={CONSTS.RULER_BOX}>Box</option>
        <option value={CONSTS.RULER_LINE}>Line</option>
      </select>
    );

    this.ruler_ui_el = (
      <div style={{
        height: "auto",
        position: "absolute",
        left: "60px",
        top: "20px",
        backgroundColor: "#FFF",
        border: "1px solid #666",
        boxShadow: "1px 1px 3px #666",
        zIndex: "10502",
        display: "none",
      }}>
        {this.select_el}
        {this.radius_el}
        {this.box_el}
        {this.cone_el}
        {this.line_el}
      </div>
    );

    document.body.appendChild(this.ruler_ui_el);

    this.redraw_ruler_config_display();

	  window.Mousetrap.bind("q q", this.hotkey_ruler_normal);
		window.Mousetrap.bind("q r", this.hotkey_ruler_radius);
		window.Mousetrap.bind("q c", this.hotkey_ruler_cone);
		window.Mousetrap.bind("q e", this.hotkey_ruler_box);
		window.Mousetrap.bind("q w", this.hotkey_ruler_line);
  }

  dispose = () => {
		window.Mousetrap.unbind("q q", this.hotkey_ruler_normal);
		window.Mousetrap.unbind("q r", this.hotkey_ruler_radius);
		window.Mousetrap.unbind("q c", this.hotkey_ruler_cone);
		window.Mousetrap.unbind("q e", this.hotkey_ruler_box);
		window.Mousetrap.unbind("q w", this.hotkey_ruler_line);

    window.r20es.render_extra_rulers = null;
    window.r20es.extra_ruler_set_mode = null;

    if(this.ruler_ui_el) {
      this.ruler_ui_el.remove();
      this.ruler_ui_el = null;
    }

    super.dispose();
  }
}

if (R20Module.canInstall()) new ExtraRulers().install();

