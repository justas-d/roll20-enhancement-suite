import {DialogBase} from "../../utils/DialogBase";
import { DOM } from "../../utils/DOM";
import {
    Dialog,
    DialogBody,
    DialogFooter,
    DialogFooterContent,
    DialogHeader
} from "../../utils/DialogComponents";
import lexCompare from "../../utils/LexicographicalComparator";
import {removeByReference} from "../../utils/ArrayUtils";
import {nearly_format_file_url} from "../../utils/MiscUtils";

const check_if_url_is_video_stream = (
        url: string,
        ok_callback: () => void,
        err_callback: () => void
) => {
    const testElement = document.createElement("video") as HTMLVideoElement;

    // NOTE(justas): TS complains that crossorigin is invalid and that I should use crossOrigin
    // but turns out crossOrigin doesn't work on firefox.
    // Great.
    testElement["crossorigin"] = "anonymous";
    testElement.volume = 0;

    const removeEventListeners = () => {
        testElement.pause();
        testElement.removeEventListener("error", onError);
        testElement.removeEventListener("canplay", onCanPlay);
        testElement.src = "";
    };

    const onError = e => {
        removeEventListeners();
        console.error(e);
        err_callback();
    };

    const onCanPlay = e => {
        removeEventListeners();
        ok_callback();
    };

    testElement.addEventListener("error", onError);
    testElement.addEventListener("canplay", onCanPlay);

    testElement.src =  url;
    console.log(url);
    testElement.play();
};

export class AnimBackgroundSetup extends DialogBase<null> {
    private _setVideoSrc: (v: string) => void;
    private _setEnabled: (state: boolean) => void;

    private _initEnabled: boolean;

    constructor() {
        super();
    }

    media_url: string;
    parent_module: any;

    public show(parent_module: any, src: string, enabled: boolean, setVideoSrc: (v: string) => void, setEnabled: (state: boolean) => void) {
        this.parent_module = parent_module;
        this._setVideoSrc = setVideoSrc;
        this._setEnabled = setEnabled;
        this.media_url = src;
        this._initEnabled = enabled;

        this.internalShow();
        this.ui_verify_media_url(this.media_url, false);
    };

    onChangeEnabled = (e) => {
        this._setEnabled(e.target.checked);
    };

    ui_is_invalid_media_url = false;

    onBlurUrl = (e) => {
        e.stopPropagation();
        this.ui_on_update_url_input(e.target.value);
    };

    ui_on_update_url_input = (url: string) => {
        this._setVideoSrc(url);
        this.media_url = url;
        this.ui_verify_media_url(url, true);
    };

    module_get_history = () => this.parent_module.getHook().config.video_history;
    module_save_history = (val: string[]) => this.parent_module.setConfigValue("video_history", val);

    ui_verify_media_url = (url: string, true_if_push_history: boolean) => {

        check_if_url_is_video_stream(url, () => {
            if(true_if_push_history) {
                const hist = this.module_get_history() as string[];
                removeByReference(hist, url);
                hist.unshift(url);
                this.module_save_history(hist);
            }

            this.ui_is_invalid_media_url = false;
            this.rerender();
        }, () => {
            this.ui_is_invalid_media_url = true;
            this.rerender();
        });
    };

    ui_toggle_history = () => {
        this.show_history = !this.show_history;
        this.rerender();
    };

    show_history = false;
    ui_history_url_attrib = "url";

    ui_history_retrieve_url = (e) => {
        return e.target.getAttribute(this.ui_history_url_attrib);
    };

    ui_history_remove = (e) => {
        const url = this.ui_history_retrieve_url(e);
        const hist = this.module_get_history();
        removeByReference(hist, url);
        this.module_save_history(hist);
        this.rerender();
    };

    ui_history_select = (e) => {
        const url = this.ui_history_retrieve_url(e);
        this.ui_on_update_url_input(url);
    };

    public render() {
        const hist = this.module_get_history();
        const hist_widgets = [];

        if(this.show_history) {
            const set_url = (widget, url) => widget.setAttribute(this.ui_history_url_attrib, url);

            for(const url of hist) {
                const style = {width: "auto", marginRight: "8px"};
                const rm_button = <input style={style} className="btn btn-danger" type="button" value="X" onClick={this.ui_history_remove}/>;
                const url_button = <input style={style} className="btn btn-success" type="button" value="Use" onClick={this.ui_history_select}/>;
                const url_text = <span title={url}>{nearly_format_file_url(url)}</span>;

                set_url(rm_button, url);
                set_url(url_button, url);

                hist_widgets.push(
                    <div>
                        {rm_button}
                        {url_button}
                        {url_text}
                </div>);
            }

            if(hist.length == 0) {
                hist_widgets.push(<div>Nothing here!</div>)
            }
        }

        return (
            <Dialog>
                <DialogHeader>
                    <h2>Animated Background Setup</h2>
                </DialogHeader>

                <DialogBody>

                    <div>
                        <i>Disclaimer: VTTES must be installed to be able to see the animated background.</i>
                    </div>

                    <br/>

                    <div style={{display: "grid", gridTemplateColumns: "auto auto", rowGap: "4px"}}>
                        <b>Enabled?</b>
                        <div>
                            <input type="checkbox" onChange={this.onChangeEnabled} checked={this._initEnabled}/>
                        </div>

                        <span>
                            <b>Media URL </b>
                            <i>(must be a direct stream)</i>
                        </span>

                        <div>
                            <input style={{paddingLeft: "8px"}} type="text" onBlur={this.onBlurUrl} value={this.media_url}/>
                        </div>
                    </div>

                    <div>
                        <span style={{float: "right"}}>
                            {this.ui_is_invalid_media_url ? <b>Invalid: Not a direct video stream</b> : <b>URL is valid!</b>}
                        </span>
                    </div>

                    <br/>

                    <button style="btn" onClick={this.ui_toggle_history}>{this.show_history ? "Hide History" : "Show History"}</button>

                    <br/>

                    <div style={{maxHeight: "500px", overflowY: "auto"}}>
                        {hist_widgets}
                    </div>

                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button style={{ boxSizing: "border-box", width: "100%" }} className="btn btn-primary" onClick={this.close}>OK</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>
        )
    }
}
