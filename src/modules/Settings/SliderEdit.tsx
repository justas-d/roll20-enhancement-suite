import { ConfigEditBase } from "./ConfigEditBase";
import { DOM } from "../../utils/DOM";

export default class SliderEdit extends ConfigEditBase {
    public constructor(props) {
        super(props);
    }

    private onChange = (e: any) => {
        e.stopPropagation();
        const val = parseFloat(e.target.value);
        this.setValue(val);

        $(e.target.parentNode).find("input")[0].title = val.toString();
    }

    protected internalRender = (): HTMLElement => {
        const min = this.getConfigView().sliderMin;
        const max = this.getConfigView().sliderMax;
        const val = this.getValue();

        return (
            <section className="compact">
                <span>{min}</span>
                <input onChange={this.onChange}
                    style={{ display: "inline-block", height: "auto", width: "80%", margin: "0 8px 0 8px", border: "none" }}
                    type="range"
                    min={min}
                    max={max}
                    step="any"
                    value={val}
                    title={val}
                />
                <span>{max}</span>

            </section> as any
        );
    }
}
