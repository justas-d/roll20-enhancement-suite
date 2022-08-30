import {DOM} from "../../utils/DOM";
import {DialogBase} from "../../utils/DialogBase";
import {
    CheckboxWithText,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogFooterContent,
    DialogHeader
} from "../../utils/DialogComponents";
import NumberEdit from "../Settings/NumberEdit";
import EditComponentWrapper from "../Settings/EditComponentWrapper";
import CheckboxEdit from "../Settings/CheckboxEdit";
import {R20} from "../../utils/R20";

export default class TokenResizeDialog extends DialogBase<string> {
    private moduleConfig: any;
    private cont: (moveTokens: boolean) => void;
    private static readonly checkboxId = "r20es-token-resize-move-tokens-checkbox";

    constructor() {
        super(null);
    }

    public show(moduleConfig: any, cont: (moveTokens: boolean) => void) {
        this.moduleConfig = moduleConfig;
        this.cont = cont;
        super.internalShow();
    };

    private getCheckbox = (): HTMLInputElement => {
        return (document.getElementById(TokenResizeDialog.checkboxId) as HTMLInputElement)
    };

    private onSubmit = (e) => {
        this.close(true);
        const moveTokens = this.getCheckbox().checked;
        this.cont(moveTokens);
    };

    private onClickCheckboxDiv = (e) => {
        if(e.target.id === TokenResizeDialog.checkboxId) return;

        const checkbox = this.getCheckbox();
        checkbox.checked = !checkbox.checked;
    };

    protected render() {

        const page = R20.getCurrentPage();
        const unitName = this.moduleConfig.config.useUnits ? page.attributes.scale_units : "squares";

        return (
            <Dialog>
                <DialogHeader>
                    <h2>Resize Token</h2>
                </DialogHeader>

                <DialogBody>
                    <div>
                        <EditComponentWrapper
                            Component={NumberEdit}
                            cfgId={"lastSquareWidth"}
                            display={"Width of a square in the token (px)"}
                            hook={this.moduleConfig}
                        />

                        <EditComponentWrapper
                            Component={NumberEdit}
                            cfgId={"lastSquareHeight"}
                            display={"Height of a square in the token (px)"}
                            hook={this.moduleConfig}
                        />

                        <EditComponentWrapper
                            Component={NumberEdit}
                            cfgId={"lastNumSquaresX"}
                            display={`Num. ${unitName} horizontally`}
                            hook={this.moduleConfig}
                        />

                        <EditComponentWrapper
                            Component={NumberEdit}
                            cfgId={"lastNumSquaresY"}
                            display={`Num. ${unitName} vertically`}
                            hook={this.moduleConfig}
                        />

                        <div style={{cursor: "pointer", display: "flex", alignItems: "center"}} onClick={this.onClickCheckboxDiv}>
                            <input type="checkbox"
                                   id={TokenResizeDialog.checkboxId}
                                   checked={this.moduleConfig.config.placeTopLeft}
                            />
                            <span style={{ marginLeft: "4px"}}>Position tokens in the top-left corner.</span>
                        </div>
                    </div>
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent >
                        <input style={{marginRight: "8px"}} className="r20btn btn" type="button" onClick={this.close} value="Close" />
                        <input className="r20btn btn" type="button" onClick={this.onSubmit} value="OK" />
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>

        );
    }
}
