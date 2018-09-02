import { ConfigEditBase } from "./ConfigEditBase";
import { DOM } from "../../tools/DOM";

export default class DropdownEdit extends ConfigEditBase {
    public constructor(props) {
        super(props);
    }

    private onChange = (e: any) => {
        e.stopPropagation();
        this.setValue(e.target.value);
    }

    protected internalRender = (): HTMLElement => {

        const vals = [];

        for (const key in this.configView.dropdownValues) {
            const val = this.configView.dropdownValues[key];

            vals.push(<option value={key}>{val}</option>);
        }
        return (
            <select className="compact" onChange={this.onChange} value={this.getValue()}>
                {vals}
            </select> as any
        );
    }
}
