import {DialogBase} from "../../utils/DialogBase";
import { DOM } from "../../utils/DOM";
import {
    Dialog,
    DialogBody,
    DialogFooter,
    DialogFooterContent,
    DialogHeader
} from "../../utils/DialogComponents";

const check_if_url_is_video_stream = (
        url: string,
        ok_callback: () => void,
        err_callback: () => void
) => {
    const testElement = document.createElement("video") as HTMLVideoElement;
    testElement.crossOrigin = "anonymous";
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

    public show(src: string, enabled: boolean, setVideoSrc: (v: string) => void, setEnabled: (state: boolean) => void) {
        this._setVideoSrc = setVideoSrc;
        this._setEnabled = setEnabled;
        this.media_url = src;
        this._initEnabled = enabled;

        this.internalShow();
        this.ui_verify_media_url();
    };

    onChangeEnabled = (e) => {
        this._setEnabled(e.target.checked);

    };

    ui_is_invalid_media_url = false;

    cb_verify_url_ok = () => {
        this.ui_is_invalid_media_url = false;
        this.rerender();
    };

    cb_verify_url_err = () => {
        this.ui_is_invalid_media_url = true;
        this.rerender();
    };

    onBlurUrl = (e) => {
        e.stopPropagation();

        this._setVideoSrc(e.target.value);
        this.media_url = e.target.value;

        this.ui_verify_media_url();
    };

    ui_verify_media_url = () => {
        check_if_url_is_video_stream(this.media_url, this.cb_verify_url_ok, this.cb_verify_url_err);
    };

    public render() {
        return (
            <Dialog>
                <DialogHeader>
                    <h2>Animated Background Setup</h2>
                </DialogHeader>

                <DialogBody>
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
                            <input type="text" onBlur={this.onBlurUrl} value={this.media_url}/>
                            {this.ui_is_invalid_media_url ? <b style={{paddingLeft: "8px"}}>Invalid: Not a direct video stream</b> : null}
                        </div>

                    </div>

                    <i>Disclaimer: R20ES must be installed to be able to see the animated background.</i>

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
