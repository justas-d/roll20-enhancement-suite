import { R20Module } from "../../utils/R20Module"
import { R20 } from "../../utils/R20";
import {IOModuleCommon} from "../IOModuleCommon";
import {IResult} from "../../utils/Result";
import {IApplyableJukeboxPlaylist, JukeboxIO} from "../../utils/JukeboxIO";
import { DOM } from "../../utils/DOM";

const does_page_have_default_camera_settings = (page: Roll20.Page) => {
  if(typeof(page.attributes.vttes_default_camera_enabled) != "boolean") return false;
  if(typeof(page.attributes.vttes_default_camera_zoom) != "number") return false;
  if(typeof(page.attributes.vttes_default_camera_x) != "number") return false;
  if(typeof(page.attributes.vttes_default_camera_y) != "number") return false;

  return true;
}

const does_page_have_default_camera_enabled = (page: Roll20.Page) => {
  if(!does_page_have_default_camera_settings(page)) {
    return false;
  }
  return page.attributes.vttes_default_camera_enabled;
}

const SHOW_MENU_IMG = "https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/png/32/map-marker.png"
const HIDE_MENU_IMG = "https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/png/32/close.png";

class CameraStartPositionModule extends R20Module.OnAppLoadBase {

  public constructor() {
    super(__dirname);
  }

  try_jump_to_default_camera = () => {

    const page = R20.getCurrentPage();

    if(R20.isGM()) {
      const cfg = this.getHook().config;
      if(!cfg.move_if_gm) {
        return;
      }
    }

    if(does_page_have_default_camera_enabled(page)) {
      this.force_jump_to_default_camera();
    }
  }

  force_jump_to_default_camera = () => {
    const page = R20.getCurrentPage();

    const center_x = page.attributes.vttes_default_camera_x;
    const center_y = page.attributes.vttes_default_camera_y;
    const zoom = page.attributes.vttes_default_camera_zoom;

    const x = center_x - R20.getCanvasWidth() * .5;
    const y = center_y - R20.getCanvasHeight() * .5;

    R20.set_zoom(zoom);

    setTimeout(() => {
      R20.set_camera_x(x);
      R20.set_camera_y(y);
    }, 100);

    if(R20.isGM()) {
      const cfg = this.getHook().config;
      if(cfg.send_local_event_messages) {
        R20.saySystem(`GM: Jumping to default camera start location...`);
      }
    }
  }

  on_page_change = (is_first_load: boolean) => {


    if(is_first_load) {
      setTimeout(this.try_jump_to_default_camera, 1000);
    }
    else {
      this.try_jump_to_default_camera();
    }

    this.hide_menu();
  };

  toggle_menu_widget: HTMLElement|null;
  toggle_menu_widget_img: HTMLImageElement;
  menu_widget: HTMLElement;

  hide_menu = () => {
    if(this.menu_widget) {
      this.menu_widget.remove();
      this.menu_widget = null;
    }

    if(this.toggle_menu_widget_img) {
      this.toggle_menu_widget_img.src = SHOW_MENU_IMG;
    }
  }

  toggle = () => {
    const page = R20.getCurrentPage();

    {
      const cfg = this.getHook().config;
      if(cfg.send_local_event_messages) {
        if(page.attributes.vttes_default_camera_enabled) {
          R20.saySystem(`GM: Disabled default camera`);
        }
        else {
          R20.saySystem(`GM: Enabled default camera`);
        }
      }
    }

    page.save({
      vttes_default_camera_enabled: !page.attributes.vttes_default_camera_enabled,
    });

    this.show_menu();
  }

  set_from_current_camera = () => {
    const x = R20.get_camera_x();
    const y = R20.get_camera_y();
    const zoom = R20.getCanvasZoom();

    const center_x = x + R20.getCanvasWidth() * .5;
    const center_y = y + R20.getCanvasHeight() * .5;

    {
      const cfg = this.getHook().config;
      if(cfg.send_local_event_messages) {
        R20.saySystem(`GM: Set default camera position: ${center_x} ${center_y} ${zoom}`);
      }
    }
    
    const page = R20.getCurrentPage();

    page.save({
      vttes_default_camera_enabled: true,
      vttes_default_camera_x: center_x,
      vttes_default_camera_y: center_y,
      vttes_default_camera_zoom: zoom,
    });

    this.show_menu();
  }

  preview_starting_camera = () => {
    this.force_jump_to_default_camera();
  }

  show_menu = () => {
    if(this.menu_widget) {
      this.menu_widget.remove();
      this.menu_widget = null;
    }

    this.toggle_menu_widget_img.src = HIDE_MENU_IMG;

    const style = {
      position: "absolute",
      top: "0px",
      right: "464px",
      zIndex: 11,
      backgroundColor: "white",
      borderBottom: "1px solid gray",
      padding: "10px",
      borderLeft: "1px solid gray",
      borderRight: "1px solid gray",
      maxWidth: "450px",
      color: "#333",
    };

    let controls = null;

    const page = R20.getCurrentPage();

    const set_from_current = <button className="btn" onclick={this.set_from_current_camera}>Set From Current Camera</button>;

    if(does_page_have_default_camera_settings(page)) {
      const toggle = <button className="btn" onclick={this.toggle}></button>;

      if(does_page_have_default_camera_enabled(page)) {
        toggle.innerText = "Enabled";
        toggle.className = "btn btn-success";
      }
      else {
        toggle.innerText = "Disabled";
        toggle.className = "btn btn-danger";
      }

      controls = (
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridGap: "4px"}}>
          {toggle}
          {set_from_current}
          <button className="btn" onclick={this.preview_starting_camera}>Preview Default Camera</button>
        </div>
      );
    }
    else {
      controls = (
        <div>
          {set_from_current}
        </div>
      );
    }

    this.menu_widget = (
      <div style={style}>
        <h3 style={{color: "#333"}}>Default Camera Position (VTTES)</h3>
        <p>This controls the location of the default camera.</p>
        <p>When this is enabled, when players enter a page, their camera location and zoom level will be set to the one configured here.</p>
        <b>Players must have the extension installed for this to work.</b>

        <div style={{marginBottom: "16px"}}/>

        {controls}

      </div>
    );

    document.body.appendChild(this.menu_widget);
  };

  public setup() {
    window.r20es.onPageChange.on(this.on_page_change);

    if(R20.isGM()) {
      {
        const widgetStyle = {
          cursor: "pointer",
          position: "absolute",
          top: "0",
          right: "468px",
          maxWidth: "32px",
          maxHeight: "32px",
          zIndex: "10000",
          backgroundColor: "lightgreen",
          padding: "0px 0px 1px",
          borderRadius: "3px",
        };


        const on_click = () => {
          if(this.menu_widget) {
            this.hide_menu();
          }
          else {
            this.show_menu();
          }
        };

        this.toggle_menu_widget_img = (
          <img src={SHOW_MENU_IMG} maxWidth="28" maxHeight="28" alt="CAM"/>
        );

        this.toggle_menu_widget = (
          <div title="Default Camera Position (VTTES)" style={widgetStyle} onclick={on_click}>
            {this.toggle_menu_widget_img}
          </div>
        );

        document.body.appendChild(this.toggle_menu_widget);
      }
    }
  }

  public dispose() {

    if(this.toggle_menu_widget) this.toggle_menu_widget.remove();
    if(this.menu_widget) this.menu_widget.remove();

    window.r20es.onPageChange.off(this.on_page_change);
    super.dispose();
  }
}

export default () => {
  new CameraStartPositionModule().install();
};

