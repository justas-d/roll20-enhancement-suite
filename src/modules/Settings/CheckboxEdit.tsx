import { ConfigEditBase } from "./ConfigEditBase";
import { DOM } from "../../utils/DOM";

export default class CheckboxEdit extends ConfigEditBase {
    public constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    private onChange = (e: any) => {
        e.stopPropagation();
        this.setValue(e.target.checked);
    }

    protected internalRender = (): HTMLElement => {
        return (
            <input onChange={this.onChange}
                checked={this.getValue()}
                type="checkbox"
                className="r20es-checkbox"
            /> as any
        );
    }
}
