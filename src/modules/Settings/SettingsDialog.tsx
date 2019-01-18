
import { DialogBase } from "../../utils/DialogBase";
import AboutDialog from "./AboutDialog";
import { Dialog, DialogFooter, DialogFooterContent, DialogHeader, DialogBody } from "../../utils/DialogComponents";
import { DOM } from "../../utils/DOM";
import * as _ from 'underscore'
import { mapObj } from "../../utils/MiscUtils";
import HookHeader from "./HookHeader";
import HookConfig from "./HookConfig";
import ChangelogDialog from "./ChangelogDialog";

export default class SettingsDialog extends DialogBase<null> {
    private hooks: any;
    private activeModule: any = null;
    private about: AboutDialog = new AboutDialog();
    private changelog: ChangelogDialog = new ChangelogDialog();

    _leftDiv: HTMLElement;

    public constructor(hooks) {
        super("r20es-settings-dialog");
        this.hooks = hooks;
    }

    public show = this.internalShow;

    private onSelect = (selectedModule: any) => {
        this.activeModule = _.isEqual(this.activeModule, selectedModule) ? null : selectedModule;


        // Note(Justas): preserve the scroll of the hook header list
        const oldScroll = this._leftDiv.scrollTop;
        this.rerender();
        this._leftDiv.scrollTop = oldScroll ;
    };

    private openAbout = () => this.about.show();
    private openChangelog = () => this.changelog.show();

    protected render = (): HTMLElement => {

        let byCategory = {};

        for (let key in this.hooks) {
            let hook = this.hooks[key];
            if (hook.force && !hook.forceShowConfig) continue;

            if (!(hook.category in byCategory))
                byCategory[hook.category] = [];

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
                        <input className="btn" type="button" onClick={this.openAbout} value="About" />
                        <input className="btn" style={{marginLeft: "8px"}} type="button" onClick={this.openChangelog} value="Changelog" />
                        <input className="btn btn-primary" style={{ float: "right" }} type="button" onClick={this.close} value="Apply & Close" />
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog> as any
        );
    }

    public dispose() {
        super.dispose();
        if(this.about) this.about.dispose();
        if(this.changelog) this.changelog.dispose();
    }
}
