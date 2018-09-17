import {DOM} from "../../tools/DOM";
import {DialogBase} from "../../tools/DialogBase";
import {Dialog, DialogBody, DialogFooter, DialogFooterContent, DialogHeader} from "../../tools/DialogComponents";
import NumberEdit from "../Settings/NumberEdit";
import EditComponentWrapper from "../Settings/EditComponentWrapper";

export default class TokenResizeDialog extends DialogBase<string> {
    private moduleConfig: any;
    private cont: () => void;

    constructor() {
        super(null, {height: "auto"});
    }

    public show(moduleConfig: any, cont: () => void) {
        this.moduleConfig = moduleConfig;
        this.cont = cont;
        super.internalShow();
    };

    private onSubmit = (e) => {
        this.close(true);
        this.cont();
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
