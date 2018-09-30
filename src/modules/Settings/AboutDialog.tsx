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
        super(null, null, true); // recenter workaround

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
                    <h1>Roll20 Enhancement Suite</h1>
                    <h2>Version {build.R20ES_VERSION}</h2>
                    <h3>Built for {build.R20ES_BROWSER}</h3>
                </DialogHeader>


                <DialogBody>

                    <img style={{width: "60%", display: "block", marginLeft: "auto", marginRight: "auto"}}
                         src={this.logoUrl} alt="Logo"/>

                    <div style={{display: "grid", gridTemplateColumns: "auto auto"}}>
                        <span>Branch</span>
                        <span>{build.R20ES_BRANCH}</span>

                        <span>Commit</span>
                        <span>{build.R20ES_COMMIT}</span>
                    </div>

                    <div style={{marginTop: "16px", marginBottom: "16px", textAlign: "center"}}>
                        <div style={{marginBottom: "8px"}}>
                            <a href={"javascript:void(0) // workaround for underpopup dialog from roll20 regarding leaving the site"}
                               onClick={() => this.openUrl("https://github.com/SSStormy/roll20-enhancement-suite/")}>
                                <img height="32" width="32"
                                     src="https://unpkg.com/simple-icons@latest/icons/github.svg"/>
                            </a>
                        </div>

                        <div>
                            <a href={"javascript:void(0) // workaround for underpopup dialog from roll20 regarding leaving the site"}
                               onClick={() => this.openUrl(Config.discordInvite)}>
                                Discord Server
                            </a>
                        </div>
                    </div>

                    <div style={{marginTop: "16px", display: "flex", justifyContent: "center", alignItems: "center"}}>

                        <style>
                            {`
                            .bmc-button
                            img{width: 27px !important;margin-bottom: 1px !important;box-shadow: none !important;border: none !important;vertical-align: middle !important;}.bmc-button{line - height: 36px !important;height:37px !important;text-decoration: none !important;display:inline-flex !important;color:#FFFFFF !important;background-color:#FF813F !important;border-radius: 3px !important;border: 1px solid transparent !important;padding: 0px 9px !important;font-size: 17px !important;letter-spacing:-0.08px !important;box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;margin: 0 auto !important;font-family:'Lato', sans-serif !important;-webkit-box-sizing: border-box !important;box-sizing: border-box !important;-o-transition: 0.3s all linear !important;-webkit-transition: 0.3s all linear !important;-moz-transition: 0.3s all linear !important;-ms-transition: 0.3s all linear !important;transition: 0.3s all linear !important;}.bmc-button:hover,
                            .bmc-button:active,
                            .bmc-button:focus {-webkit - box - shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;text-decoration: none !important;box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;opacity: 0.85 !important;color:#FFFFFF !important;}
                        `}
                        </style>

                        <a className="bmc-button" target="_blank" href="https://www.buymeacoffee.com/stormy">
                            <img src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" alt="Buy me a coffee"/>
                            <span style="margin-top: 4px; margin-left:5px">Buy me a coffee</span>
                        </a>
                    </div>

                </DialogBody>

                <section style={{margin: "20px"}}>
                    <input
                        className="btn"
                        style={{width: "100%", height: "auto", boxSizing: "border-box"}}
                        type="button"
                        onClick={this.close}
                        value="OK"/>
                </section>

            </Dialog> as any
        )
    }
}
