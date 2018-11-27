import {DialogBase} from "../../utils/DialogBase";
import { DOM } from "../../utils/DOM";
import {
    Dialog,
    DialogBody,
    DialogFooter,
    DialogFooterContent,
    DialogHeader
} from "../../utils/DialogComponents";

export class AnimBackgroundSetup extends DialogBase<null> {
    private _setVideoSrc: (v: string) => void;
    private _setEnabled: (state: boolean) => void;
    private _initSrc: string;
    private _initEnabled: boolean;

    constructor() {
        super();
    }

    public show(src: string, enabled: boolean, setVideoSrc: (v: string) => void, setEnabled: (state: boolean) => void) {
        this._setVideoSrc = setVideoSrc;
        this._setEnabled = setEnabled;
        this._initSrc = src;
        this._initEnabled = enabled;
        this.internalShow();
    };

    onChangeEnabled = (e) => {
        this._setEnabled(e.target.checked);
    };

    onBlurUrl = (e) => {
        this._setVideoSrc(e.target.value);
    };

    public render() {
        return (
            <Dialog>
                <DialogHeader>
                    <h2>Animated Background Setup</h2>
                </DialogHeader>

                <DialogBody>
                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "4px"}}>
                        <b>Enabled?</b>
                        <div>
                            <input type="checkbox" onChange={this.onChangeEnabled} checked={this._initEnabled}/>
                        </div>

                        <span>
                            <b>Media URL </b>
                            <i>(must be a direct stream)</i>
                        </span>

                        <input type="text" onBlur={this.onBlurUrl} value={this._initSrc}/>
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
