import { ConfigEditBase } from "./ConfigEditBase";
import { DOM } from "../../tools/DOM";

export default class MouseButtonEdit extends ConfigEditBase {
    public constructor(props) {
        super(props);
    }

    private onChange = (e: any) => {
        e.stopPropagation();
        this.setValue(e.target.value);
    }

    private detect = (e: any) => {
        e.stopPropagation();
        const button = e.button;
        const input = $(e.target.parentNode).find("input")[0];
        input.value = button;

        this.setValue(button);
    }

    protected internalRender = (): HTMLElement => {
        return (
            <span>
                <input onChange={this.onChange}
                    className="compact"
                    type="number"
                    value={this.getValue()}
                />

                <span onMouseup={this.detect} style={{marginLeft: "8px", padding: "0px 4px 0px 4px", border: "solid 1px", background: "#EEE"}}>
                    Detect (click me)
                </span>

            </span> as any
        );
    }
}
