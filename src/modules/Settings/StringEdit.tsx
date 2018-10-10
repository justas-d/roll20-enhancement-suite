import { ConfigEditBase } from "./ConfigEditBase";
import { DOM } from "../../utils/DOM";

export default class StringEdit extends ConfigEditBase {
    public constructor(props) {
        super(props);
    }

    private onChange = (e: any) => {
        e.stopPropagation();
        this.setValue(e.target.value);
    }

    protected internalRender = (): HTMLElement =>  {
        return <input className="compact" type="text" onChange={this.onChange} value={this.getValue() || ""} /> as any
    }
};
