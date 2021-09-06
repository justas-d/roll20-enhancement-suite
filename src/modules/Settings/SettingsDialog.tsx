
import { DialogBase } from "../../utils/DialogBase";
import AboutDialog from "./AboutDialog";
import { Dialog, DialogFooter, DialogFooterContent, DialogHeader, DialogBody } from "../../utils/DialogComponents";
import { DOM } from "../../utils/DOM";
import * as _ from 'underscore'
import { mapObj } from "../../utils/MiscUtils";
import HookHeader from "./HookHeader";
import HookConfig from "./HookConfig";
import ChangelogDialog from "./ChangelogDialog";
import { LoadingDialog } from '../../utils/DialogComponents';
import { readFile } from '../../utils/MiscUtils';
import { saveAs } from 'save-as'
import { Config } from "../../utils/Config";

const SETTINGS_FILE_EXTENSION = ".vttes_settings_json";

interface Settings_Struct {
  version: number;
  type: string; // vttes_settings
  settings: any;
};

export default class SettingsDialog extends DialogBase<null> {
  hooks: any;
  activeModule: any = null;
  about: AboutDialog = new AboutDialog();
  changelog: ChangelogDialog = new ChangelogDialog();

  _leftDiv: HTMLElement;

  constructor(hooks) {
    super("r20es-settings-dialog");
    this.hooks = hooks;
  }

  show = this.internalShow;

  on_import_settings_click = () => {

    const el = (
      <input 
        type="file"
        accept={SETTINGS_FILE_EXTENSION}
      />
    )

    const listener = async () => {
      el.removeEventListener("change", listener);

      const f_handle = el.files[0];
      
      let plsWait = new LoadingDialog("Overwriting");
      plsWait.show();

      try {
        const read_result = await readFile(f_handle) as string;
        const data = JSON.parse(read_result) as Settings_Struct

        if(data.version != 1) {
          throw `Expected 'version' to be 1, got: ${data.version}`;
        }

        if(data.type != "vttes_settings") {
          throw `Expected 'type' to be 'vttes_settings', got: ${data.type}`;
        }

        if(typeof(data.settings) != "object") {
          throw `Expected 'settings' to be a table, got: ${typeof(data.settings)}`;
        }

        for(const id in window.r20es.hooks) {
          const hook = window.r20es.hooks[id];
          if(data.settings[id]) {
            hook.config = data.settings[id];
          }
        }

        window.r20es.save_configs();

        this.rerender();
      } catch(e) {
        alert(e);
        console.trace();
        console.error(e);
      }

      plsWait.dispose();
    };

    el.addEventListener("change", listener);
    el.click();
  }

  on_export_settings_click = () => {
    let export_data = {
      version: 1,
      type: "vttes_settings",
      settings: {}
    } as Settings_Struct;

    for(const id in window.r20es.hooks) {
      const hook = window.r20es.hooks[id];
      export_data.settings[id] = hook.config;
    }

    const json = JSON.stringify(export_data, null, 2);
    const json_blob = new Blob([json], { type: 'data:application/javascript;charset=utf-8' });

    const now = new Date();
    const filename = now.toLocaleString() + SETTINGS_FILE_EXTENSION;
    saveAs(json_blob, filename);
  }


  onSelect = (selectedModule: any) => {
    this.activeModule = _.isEqual(this.activeModule, selectedModule) ? null : selectedModule;

    // NOTE(justasd): preserve the scroll of the hook header list
    const oldScroll = this._leftDiv.scrollTop;
    this.rerender();
    this._leftDiv.scrollTop = oldScroll ;
  };

  openAbout = () => this.about.show();
  openChangelog = () => this.changelog.show();

  render = (): HTMLElement => {

    let byCategory = {};

    for (let key in this.hooks) {
      let hook = this.hooks[key];
      if (hook.force && !hook.forceShowConfig) continue;

      if (!(hook.category in byCategory)) {
        byCategory[hook.category] = [];
      }

      byCategory[hook.category].push(key);
    }

    const leftDiv = (
      <div className="left">
        {mapObj(byCategory, (bucket, categoryName) =>
          <div>
            <h3>{categoryName}</h3>
            <div className="r20es-indent">
              {bucket.map(id =>
                <HookHeader
                  selected={this.activeModule && this.activeModule.id === id}
                  onSelect={this.onSelect}
                  hook={this.hooks[id]}
                />)
              }
            </div>
          </div>
        )}
      </div>
    );

    this._leftDiv = leftDiv;

    return (
      <Dialog className="r20es-settings-flex-wrapper">
        <DialogHeader>
          <h2>VTT Enhancement Suite Module Settings</h2>
        </DialogHeader>

        <DialogBody>
          {leftDiv}
          {this.activeModule
            ?
            <div className="r20es-indent right">
              <HookConfig hook={this.activeModule}/>
            </div>
            :
            <div className="r20es-indent right noconfig">
              <p>Select a module from the left to see its description and options</p>
            </div>
          }
        </DialogBody>

        <DialogFooter>
          <DialogFooterContent>
            <input 
              className="btn" 
              type="button" 
              onClick={this.openAbout} 
              value="About"
            />
            <input 
              className="btn" 
              style={{marginLeft: "8px"}} 
              type="button" 
              onClick={this.openChangelog} 
              value="Changelog" 
            />

            <input
              type="button"
              style={{marginLeft: "8px"}} 
              className="btn"
              value="Import Settings"
              onClick={this.on_import_settings_click}
            />

            <input
              type="button"
              className="btn"
              style={{marginLeft: "8px"}} 
              value="Export Settings"
              onClick={this.on_export_settings_click}
            />

            <input 
              className="btn" 
              style={{ float: "right" }} 
              type="button" 
              onClick={this.close} 
              value="Apply & Close" 
            />
          </DialogFooterContent>
        </DialogFooter>
      </Dialog> as any
    );
  }

  dispose() {
    super.dispose();
    if(this.about) this.about.dispose();
    if(this.changelog) this.changelog.dispose();
  }
}
