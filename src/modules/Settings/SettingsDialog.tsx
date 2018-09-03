import { DialogBase } from "../../tools/DialogBase";
import AboutDialog from "./AboutDialog";
import { Dialog, DialogFooter, DialogFooterContent, DialogHeader, DialogBody } from "../../tools/DialogComponents";
import { DOM } from "../../tools/DOM";
import * as _ from 'underscore'
import { mapObj } from "../../tools/MiscUtils";
import HookHeader from "./HookHeader";
import HookConfig from "./HookConfig";

export default class SettingsDialog extends DialogBase<null> {
    private hooks: any;
    private activeModule: any = null;
    private about: AboutDialog = new AboutDialog();

    public constructor(hooks) {
        super("r20es-settings-dialog");
        this.hooks = hooks;
    }

    public show = this.internalShow;

    private onSelect = (selectedModule: any) => {
        this.activeModule = _.isEqual(this.activeModule, selectedModule) ? null : selectedModule;

        this.rerender();
    }

    private openAbout = () => {
        this.about.show();
    }

    protected render = (): HTMLElement => {

        let byCategory = {};

        for (let key in this.hooks) {
            let hook = this.hooks[key];
            if (hook.force && !hook.forceShowConfig) continue;

            if (!(hook.category in byCategory))
                byCategory[hook.category] = [];

            byCategory[hook.category].push(key);
        }

        return (
            <Dialog>
                <DialogHeader>
                    <h2>Roll20 Enhancement Suite Module Settings</h2>
                </DialogHeader>
                <hr />

                <DialogBody>
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

                    <div className="r20es-indent right">
                        {this.activeModule
                            ? <HookConfig hook={this.activeModule} />
                            : <p>Select a module from the left to see it's description and options.</p>
                        }
                    </div>

                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <input className="btn" type="button" onClick={this.openAbout} value="About" />
                        <input className="btn" style={{ float: "right" }} type="button" onClick={this.close} value="Apply & Close" />
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog> as any
        );
    }

    public dispose() {
        super.dispose();
        this.about.dispose();
    }
}
