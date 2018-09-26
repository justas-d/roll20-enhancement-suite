import {DOM} from "../../tools/DOM";
import {DialogBase} from "../../tools/DialogBase";
import {Dialog, DialogBody, DialogFooter, DialogFooterContent, DialogHeader} from "../../tools/DialogComponents";
import NumberEdit from "../Settings/NumberEdit";
import EditComponentWrapper from "../Settings/EditComponentWrapper";

export default class TokenResizeDialog extends DialogBase<string> {
    private moduleConfig: any;
    private cont: (moveTokens: boolean) => void;
    private static readonly checkboxId = "r20es-token-resize-move-tokens-checkbox";

    constructor() {
        super(null, {height: "auto"});
    }

    public show(moduleConfig: any, cont: (moveTokens: boolean) => void) {
        this.moduleConfig = moduleConfig;
        this.cont = cont;
        super.internalShow();
    };

    private onSubmit = (e) => {
        this.close(true);
        const moveTokens = (document.getElementById(TokenResizeDialog.checkboxId) as HTMLInputElement).checked;
        this.cont(moveTokens);
    };

    protected render() {

        return (
            <Dialog>
                <DialogHeader>
                    <h2>TokenResize</h2>
                </DialogHeader>

                <DialogBody>
                    <div>
                        <EditComponentWrapper
                            Component={NumberEdit}
                            cfgId={"lastSquareWidth"}
                            display={"Map square width (px)"}
                            hook={this.moduleConfig}
                        />

                        <EditComponentWrapper
                            Component={NumberEdit}
                            cfgId={"lastSquareHeight"}
                            display={"Map square height (px)"}
                            hook={this.moduleConfig}
                        />

                        <EditComponentWrapper
                            Component={NumberEdit}
                            cfgId={"lastNumSquaresX"}
                            display={"Num. squares horizontally"}
                            hook={this.moduleConfig}
                        />

                        <EditComponentWrapper
                            Component={NumberEdit}
                            cfgId={"lastNumSquaresY"}
                            display={"Num. squares vertically"}
                            hook={this.moduleConfig}
                        />

                        <span>
                        <input type="checkbox"
                               id={TokenResizeDialog.checkboxId}
                               checked={this.moduleConfig.config.placeTopLeft}
                        />
                            <span>Position tokens in the top-left corner.</span>
                        </span>
                    </div>
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent >
                        <input className="r20btn btn" type="button" onClick={this.close} value="Close" />
                        <input className="r20btn btn" type="button" onClick={this.onSubmit} value="OK" />
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>

        );
    }
}
