import { ConfigEditBase } from "./ConfigEditBase";
import { DOM } from "../../tools/DOM";

export default class ColorEdit extends ConfigEditBase {
    public constructor(props) {
        super(props);
    }

    private onChange = (e: any) => {
        e.stopPropagation();
        const val = e.target.value;
        const newCols = [
            parseInt(val.charAt(1) + val.charAt(2), 16),
            parseInt(val.charAt(3) + val.charAt(4), 16),
            parseInt(val.charAt(5) + val.charAt(6), 16),
        ];

        this.setValue(newCols);
    }

    protected internalRender = (): HTMLElement => {
        const cols = this.getValue();
        const val = `#${cols[0].toString(16)}${cols[1].toString(16)}${cols[2].toString(16)}`;

        return (
            <input onChange={this.onChange}
                type="color"
                className="compact"
                value={val}
            /> as any
        )
    }
}
