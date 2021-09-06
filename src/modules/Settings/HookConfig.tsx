import { DOM } from "../../utils/DOM";
import { strIsNullOrEmpty } from "../../utils/MiscUtils";
import { R20 } from "../../utils/R20";
import {Config }from "../../utils/Config";
import StringEdit from "./StringEdit";
import DropdownEdit from "./DropdownEdit";
import CheckboxEdit from "./CheckboxEdit";
import SliderEdit from "./SliderEdit";
import NumberEdit from "./NumberEdit";
import ColorEdit from "./ColorEdit";
import MouseButtonEdit from "./MouseButtonEdit";
import MediaWidget from "../../MediaWidget";
import EditComponentWrapper from "./EditComponentWrapper";
import hasBetteR20 = R20.hasBetteR20;

interface IMediaData {
    url: string;
    description: string;
}

export default class HookConfig extends DOM.ElementBase {
    private hook: any;
    private media: IMediaData[];

    public constructor(props) {
        super();

        this.hook = props.hook;
        if (this.hook.media) {
            this.media = [];

            for (const url in this.hook.media) {
                console.log(url);

                this.media.push({
                    url: Config.website + url,
                    description: this.hook.media[url]
                });
            }
        }
    }

    protected internalRender = (): HTMLElement => {

        const elemMap = {
            "string": StringEdit,
            "dropdown": DropdownEdit,
            "checkbox": CheckboxEdit,
            "slider": SliderEdit,
            "number": NumberEdit,
            "color": ColorEdit,
            "mouse_button_index": MouseButtonEdit,
        };

        let elems = [];

        if (this.hook.configView ) {

            let nth = 0;
            for (let cfgId in this.hook.configView) {

                const cfg = this.hook.configView[cfgId];

                if(!hasBetteR20() && cfg.onlyWhenHasB20) {
                    continue;
                }

                if (!(cfg.type in elemMap)) {
                    alert(`Unknown config type: ${cfg.type}`);
                    continue;
                }

                const Component = elemMap[cfg.type];

                const bgColor= nth % 2 === 0 ? "rgb(249,249,249)" : undefined;

                elems.push(<div style={{
                    borderRight: "1px lightgray solid",
                    paddingRight: "8px",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    paddingBottom: "8px",
                    background: bgColor
                }}>
                    <span title={cfgId} className="text">{cfg.display}</span>
                </div>);
                elems.push(<div style={{paddingLeft: "8px", background: bgColor}}>
                    <Component  configName={cfgId} hook={this.hook} />
                </div>);

                nth++;
            }
        }

        const urlHyperlinks = [];

        if(this.hook.urls) {

            for(const msg in this.hook.urls) {
                const url = this.hook.urls[msg];

                urlHyperlinks.push(<a href="javascript:void(0)" onClick={() => window.open(url, "_blank")}>{msg}</a>);
            }
        }

        return (
            <div className="more-settings">

                {!strIsNullOrEmpty(this.hook.description) &&
                    <div>
                        <h3 title={this.hook.id + " " + this.hook.filename}>{this.hook.name}</h3>
                        <hr style={{ marginTop: "4px" }} />

                        <div className="r20es-indent">
                            <p>{this.hook.description}</p>

                            <p>{urlHyperlinks}</p>

                            {this.hook.gmOnly &&
                                <p>This module is only usable by GMs (which you {R20.isGM() ? "are" : "aren't"})</p>
                            }

                        </div>
                    </div>
                }

                {elems.length > 0 &&
                    <div>
                        <h3>Options</h3>
                        <hr style={{ marginTop: "4px" }} />

                        <ul className="r20es-indent" style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>
                            {elems}
                        </ul>
                    </div>
                }

                {this.media &&

                    <div>
                        <h3>Media</h3>
                        <hr style={{ marginTop: "4px" }} />

                        {this.media.map(data => <MediaWidget url={data.url} description={data.description}/>)}
                    </div>
                }
            </div> as any
        );
    }
}
