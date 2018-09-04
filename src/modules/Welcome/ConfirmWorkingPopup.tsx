import { DOM } from "../../tools/DOM";
import { DialogBase } from "../../tools/DialogBase";
import { getExtUrlFromPage } from "../../tools/MiscUtils";

export default class ConfirmWorkingPopup extends DOM.ElementBase {

    private logoUrl: string;
    private interval: number;
    private sec: number = 0;

    constructor() {
        super();

        getExtUrlFromPage("logo.svg", 5000)
            .then((url: string) => {
                this.logoUrl = url;
                this.rerender();
            })
            .catch(err => console.error(`Failed to get logo.svg: ${err}`));
    }

    killMe() {
        if (this.interval) clearInterval(this.interval);
        this.dispose();
    }

    doDots = () => {
        this.sec++;

        if (this.sec > 5) {
            this.killMe();
        }
    }

    onClick = () => this.killMe();

    internalRender() {
        this.interval = setInterval(this.doDots, 1000) as any;

        return (
            <div className="r20es-welcome" style={{ background: "rgba(6,26,45,255)" }} onClick={this.onClick}>
                <img style={{ display: "block", width: "100%", marginBottom: "8px" }} src={this.logoUrl} alt="Logo" />
                <div style={{ color: "#FFF" }}>R20ES has been loaded!</div>
            </div>
        );
    }
}
