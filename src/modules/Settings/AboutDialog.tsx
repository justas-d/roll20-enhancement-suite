import {DialogBase} from "../../tools/DialogBase";
import {getExtUrlFromPage} from "../../tools/MiscUtils";
import {Dialog, DialogHeader, DialogBody} from "../../tools/DialogComponents";
import {DOM} from "../../tools/DOM";
import {Config} from "../../tools/Config";

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
        super(null, {
            maxHeight: "100%"
        }, true); // recenter workaround

        getExtUrlFromPage("logo.svg", 5000)
            .then((url: string) => this.logoUrl = url)
            .catch(err => console.error(`Failed to get logo.svg: ${err}`));
    }

    private openUrl(url: string) {
        var redir = window.open(url, "_blank");
        redir.location;
    }

    protected render = (): HTMLElement => {
        const mkEntry = (what, data) =>
            <div>
                {what}
                <span style={{float: "right"}}>{data}</span>
            </div>

        return (
            <Dialog>
                <DialogHeader style={{textAlign: "center"}}>
                    <a href={"javascript:void(0) // workaround for underpopup dialog from roll20 regarding leaving the site"}
                       onClick={() => this.openUrl(Config.website)}>
                        <h1 style="color: blue">Roll20 Enhancement Suite</h1>
                    </a>
                    <h2>Version {build.R20ES_VERSION}</h2>
                    <h3>Built for {build.R20ES_BROWSER}</h3>
                </DialogHeader>


                <DialogBody>

                    <img style={{width: "60%", display: "block", marginLeft: "auto", marginRight: "auto"}}
                         src={this.logoUrl} alt="Logo"/>

                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <div>
                            <div>
                                <b>Built by</b>
                            </div>

                            <div>
                                SSStormy, Giddy
                            </div>

                            <div>
                                <b>With contributions from</b>
                            </div>

                            <div style={{maxWidth: "180px"}}>
                                Mike, Aaron, Blurn Glanstone, Tobyn, Fredrik, Ryan Wenneker, BuckeyeFan79
                            </div>
                        </div>

                        <div>
                            <div>
                                <b>And other work by</b>
                            </div>

                            <div>
                                Jay "Vanguard" Fothergill
                            </div>
                        </div>

                    </div>

                    <hr/>

                    <div style={{display: "grid", gridTemplateColumns: "auto auto"}}>
                        <span>Branch</span>
                        <span>{build.R20ES_BRANCH}</span>

                        <span>Commit</span>
                        <span>{build.R20ES_COMMIT}</span>
                    </div>

                    <div style={{marginTop: "16px", marginBottom: "16px", textAlign: "center"}}>

                        <span style={{marginRight: "8px"}}>
                            <a href={"javascript:void(0) // workaround for underpopup dialog from roll20 regarding leaving the site"}
                               onClick={() => this.openUrl(Config.discordInvite)}>
                                <img height="32" width="32" className="discord-logo"
                                     src="https://discordapp.com/assets/41484d92c876f76b20c7f746221e8151.svg"/>
                            </a>
                        </span>

                        <span style={{marginRight: "8px"}}>
                            <a href={"javascript:void(0) // workaround for underpopup dialog from roll20 regarding leaving the site"}
                               onClick={() => this.openUrl("https://github.com/SSStormy/roll20-enhancement-suite/")}>
                                <img height="32" width="32" className="github-logo"
                                     src="https://unpkg.com/simple-icons@latest/icons/github.svg"/>
                            </a>
                        </span>

                        <span>
                            <a href={"javascript:void(0) // workaround for underpopup dialog from roll20 regarding leaving the site"}
                               onClick={() => this.openUrl(Config.buyMeACoffee)}>
                                <img height="32" width="32"
                                     src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg"
                                     alt="Buy me a coffee"/>
                            </a>
                        </span>

                    </div>

                </DialogBody>

                <section style={{margin: "20px"}}>
                    <input
                        className="btn btn-primary"
                        style={{width: "100%", height: "auto", boxSizing: "border-box"}}
                        type="button"
                        onClick={this.close}
                        value="OK"/>
                </section>

            </Dialog> as any
        )
    }
}
