import { DOM } from "./DOM";
import { copy } from "./MiscUtils";
import { DialogBase } from "./DialogBase";

class LoadingDialog extends DialogBase {
    constructor(action, className, style) {
        console.log("ctoring");
        super(className, style);

        this.action =action;
    }

    render() {
        return (
            <Dialog>
                <DialogBody>
                    <h3>{this.action}, please wait...</h3>
                </DialogBody>
            </Dialog>
        )
    }
}


function DialogHeader() {
    return <div className="dialog-header"></div>
}

function DialogBody() {
    return <div className="dialog-body"></div>
}

function DialogFooter() {
    return (
        <div className="dialog-footer">
            <hr />
        </div>
    );
}

function DialogFooterContent() {
    return <div className="dialog-footer-content"></div>
}

function Dialog() {
    return <div className="r20es-dialog"></div>
}

function CheckboxWithText(_props) {
    const props = copy(_props, {
        style: { verticalAlign: "middle", marginRight: "4px" },
        type: "checkbox"
    });

    const checkbox = DOM.createElement("input", props);
    const Component = props && props.component || "div";

    return (<Component>
        {checkbox}
        <span style={{ verticalAlign: "middle" }}>{props.checkboxText}</span>
    </Component>
    );
}

export { CheckboxWithText, DialogHeader, DialogBody, 
    DialogFooter, Dialog, DialogFooterContent,
    LoadingDialog }
