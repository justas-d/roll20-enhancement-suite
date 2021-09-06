import { DOM } from "../../utils/DOM";
import { DialogBase } from "../../utils/DialogBase";
import { R20Module } from "../../utils/R20Module";
import { LOGO_SVG_B64 } from "../../utils/MiscUtils";
import SettingsModuleButtonId from "../Settings/Vars";

export default class WelcomePopup extends DOM.ElementBase {
  private mod: any;

  constructor(mod: any) {
    super();
    this.mod = mod;
  }

  close() {
    this.dispose();
  }

  finish() {
    const hook = this.mod.getHook();
    hook.config.showStartupGuide = false;
    window.r20es.save_configs();
    this.close();
  }

  onClickClose = () => {
    this.finish();
  }

  onClickLater = () => {
    this.close();
  }

  onClickNext = () => {
    this.finish();

    $("a[href='#mysettings']").click();
    const btn = document.getElementById(SettingsModuleButtonId);
    const oldBorder = btn.style.border

    setTimeout(() => {
      btn.style.border = "solid red 5px";
    }, 500);

    setTimeout(() => {
      btn.style.border = oldBorder;
      $(btn).click();
    }, 1500);
  }

  protected internalRender(): HTMLElement {
    const buttonStyle = { marginRight: "8px" };

    return (
      <div className="r20es-welcome">
        <section style={{ display: "flex", justifyContent: "space-between" }}>
          <section>
            <h3>Welcome to the VTT Enhancement Suite!</h3>
            <hr style={{ margin: "5px 0 15px 0" }} />

            <p>To get started, we recommend taking a look at the settings menu. There you can discover, learn and configure the modules this plugin provides.</p>
            <p>It can be found underneath the "My Settings" tab in the sidebar.</p>
            <p>Would you like us to take you there?</p>
          </section>

          <section>
            <img style={{ height: "100%" }} src={LOGO_SVG_B64} alt="Logo" />
          </section>
        </section>

        <div style={{ float: "right" }}>
          <button className="btn" style={buttonStyle} onClick={this.onClickClose}>I'll figure it out</button>
          <button className="btn" style={buttonStyle} onClick={this.onClickLater}>Later</button>
          <button className="btn" style={buttonStyle} onClick={this.onClickNext}>Let's go!</button>
        </div>
      </div> as any
    );
  }
}
