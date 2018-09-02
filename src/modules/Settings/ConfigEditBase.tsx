import { DOM } from "../../tools/DOM";
import { R20Module } from "../../tools/R20Module";

export abstract class ConfigEditBase extends DOM.ElementBase {
    protected hook: any;
    protected configName: string;
    protected configView: any;

    public constructor(props) {
        super();
        this.hook = props.hook;
        this.configName = props.configName;
        this.configView = this.hook.configView[this.configName];
    }

    protected setValue(val) {
        const oldVal = this.hook.config[this.configName];

        this.hook.config[this.configName] = val;
        this.hook.saveConfig();

        const mod = R20Module.getModule(this.hook.filename);
        if ("onSettingChange" in mod && typeof (mod.onSettingChange) === "function") {
            mod.onSettingChange(this.configName, oldVal, val);
        }
    }

    public getValue = () => this.hook.config[this.configName];

    protected getConfigView = () => this.configView;
}
