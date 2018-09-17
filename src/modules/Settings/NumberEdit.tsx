import {ConfigEditBase} from "./ConfigEditBase";
import {DOM} from "../../tools/DOM";

export default class NumberEdit extends ConfigEditBase {
    public constructor(props) {
        super(props);
    }

    private onChange = (e: any) => {
        e.stopPropagation();
        this.setValue(parseFloat(e.target.value));
    }

    protected internalRender = (): HTMLElement => {
        const val = (
            <input onChange={this.onChange}
                   className="compact"
                   type="number"
                   value={this.getValue()}
            /> as any
        );

        const view = this.getConfigView();

        if (view) {
            const min = view.numberMin;
            const max = view.numberMax;

            if (min !== undefined) val.min = min;
            if (max !== undefined) val.max = max;
        }

        return val;
    }
}
