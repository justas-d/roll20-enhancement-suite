import { DOM } from "../../tools/DOM";
import { R20 } from "../../tools/R20";
import { R20Module } from "../../tools/R20Module";

export default class HookHeader extends DOM.ElementBase {
    private onSelect: (hook: any) => void = null;
    private selected: boolean;
    private hook: any;

    public constructor(props) {
        super();

        this.hook = props.hook;
        this.onSelect = props.onSelect;
        this.selected = props.selected;
    }

    private onClick = (e: any) => {
        e.stopPropagation();

        if (e.target.tagName.toLowerCase() === "input") return; // ignore if clicked on the checkbox

        this.onSelect(this.hook);
    }

    private onCheckboxChange = (e: any) => {
        e.stopPropagation();

        const mod = R20Module.getModule(this.hook.filename);
        mod.toggleEnabledState();
    }

    protected internalRender = (): HTMLElement => {
        let style: any = {};
        const isDisabled = !R20.isGM() && this.hook.gmOnly;

        if (isDisabled) {
            style.color = "rgb(200,200,200)";
        }

        if (this.selected) {
            style.backgroundColor = "rgb(240,240,240)";
        }

        return (
            <div>
                <div style={style} className="r20es-clickable-text" onClick={this.onClick} title={isDisabled ? "This module is GM only." : ""}>
                    {!this.hook.force &&
                        <input onChange={this.onCheckboxChange} checked={this.hook.config.enabled} type="checkbox" />
                    }
                    <span className="text">{this.hook.name}</span>
                </div>
            </div> as any
        );
    }
}
