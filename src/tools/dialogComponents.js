import { concatClassName, copy } from "./miscUtil";
import { createElementJsx } from "./createElement";

function DialogHeader(props) {
    return <div className={concatClassName(props, "dialog-header")}></div>
}

function DialogBody(props, ) {
    return <div className={concatClassName(props, "dialog-body")}></div>
}

function DialogFooter(props) {
    return (
        <div className={concatClassName(props, "dialog-footer")}>
            <hr />
        </div>
    );
}

function DialogFooterContent(props) {
    return <div className={concatClassName(props, "dialog-footer-content")}></div>
}

function Dialog(props) {
    return <div className={concatClassName(props, "r20es-dialog")}></div>
}

function CheckboxWithText(_props) {
    const props = copy(_props, {
        style: { verticalAlign: "middle", marginRight: "4px" },
        type: "checkbox"
    });

    const checkbox = createElementJsx("input", props);
    const Component = props && props.component || "div";

    return (<Component>
        {checkbox}
        <span style={{ verticalAlign: "middle" }}>{props.checkboxText}</span>
    </Component>
    );
}

export { CheckboxWithText, DialogHeader, DialogBody, DialogFooter, Dialog, DialogFooterContent }