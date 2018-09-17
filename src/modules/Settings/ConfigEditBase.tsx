import { DOM } from "../../tools/DOM";
import { R20Module } from "../../tools/R20Module";

export abstract class ConfigEditBase extends DOM.ElementBase {
    protected hook: any;
    protected configName: string;
    protected configView?: any;

    public constructor(props) {
        super();
        this.hook = props.hook;
        this.configName = props.configName;
        this.configView = this.hook.configView && this.hook.configView[this.configName];
    }

    protected setValue(val) {        
        const mod = R20Module.getModule(this.hook.filename);
        mod.setConfigValue(this.configName, val);
    }

    public getValue = () => this.hook.config[this.configName];

    protected getConfigView = () => this.configView;
}
