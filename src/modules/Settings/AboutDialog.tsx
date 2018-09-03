import { DialogBase } from "../../tools/DialogBase";
import { getExtUrlFromPage } from "../../tools/MiscUtils";
import { Dialog, DialogHeader, DialogBody } from "../../tools/DialogComponents";
import { DOM } from "../../tools/DOM";

declare namespace build {
    export const R20ES_VERSION: string;
    export const R20ES_COMMIT: string;
    export const R20ES_BRANCH: string;
    export const R20ES_BROWSER: string;
}

export default class AboutDialog extends DialogBase<null> {
    private logoUrl: string = null;

    public show = this.internalShow;

    constructor() {
        super(null, null, true); // recenter workaround

        getExtUrlFromPage("logo.svg", 5000)
            .then((url: string) => this.logoUrl = url)
            .catch(err => console.error(`Failed to get logo.svg: ${err}`));
    }

    private openGithub() {
        var redir = window.open("https://github.com/SSStormy/roll20-enhancement-suite/", "_blank");
        redir.location;
    }

    protected render = (): HTMLElement => {
        const mkEntry = (what, data) =>
            <div>
                {what}0
                <span style={{ float: "right" }}>{data}</span>
            </div>

        return (
            <Dialog>
                <DialogHeader style={{ textAlign: "center" }}>
                    <h1>Roll20 Enhancement Suite</h1>
                    <h2>Version {build.R20ES_VERSION}</h2>
                    <h3>Built for {build.R20ES_BROWSER}</h3>
                </DialogHeader>


                <DialogBody>

                    <img style={{ width: "60%", display: "block", marginLeft: "auto", marginRight: "auto" }} src={this.logoUrl} alt="Logo" />


                    <section style={{ marginTop: "16px", marginBottom: "16px", textAlign: "center" }}>
                        <a href={"javascript:void(0) // workaround for underpopup dialog from roll20 regarding leaving the site"} onClick={this.openGithub}>
                            <img height="32" width="32" src="https://unpkg.com/simple-icons@latest/icons/github.svg" />
                        </a>
                    </section>

                    <section>
                        <table>
                            {mkEntry("Git Branch", build.R20ES_BRANCH)}
                            {mkEntry("Commit", build.R20ES_COMMIT)}
                        </table>
                    </section>


                </DialogBody>

                <section style={{ margin: "20px" }}>
                    <input
                        className="btn"
                        style={{ width: "100%", height: "auto", boxSizing: "border-box" }}
                        type="button"
                        onClick={this.close}
                        value="OK" />
                </section>

            </Dialog> as any
        )
    }
}
