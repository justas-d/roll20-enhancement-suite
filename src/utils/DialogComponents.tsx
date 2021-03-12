import { DOM } from "./DOM";
import { copy } from "./MiscUtils";
import { DialogBase } from "./DialogBase";

class LoadingDialog extends DialogBase<void> {
  show = this.internalShow;
  action_element: HTMLElement;

  constructor(action: string, className?: string, style?: any) {
    super(className, style);

    this.action_element= <h3>{action}</h3>;
  }

  set_text = (text: string) => {
    this.action_element.innerText = text;
  }

  render = (): HTMLElement => {
    return (
      <Dialog>
        <DialogBody>
          {this.action_element}
        </DialogBody>
      </Dialog>
    )
  }
}

function DialogHeader(props: any): any {
    return <div className="dialog-header"></div>
}

function DialogBody(props: any): any {
    return <div className="dialog-body"></div>
}

function DialogFooter(props: any): any {
    return (
        <div className="dialog-footer">
            <hr />
        </div>
    );
}

function DialogFooterContent(props: any): any {
    return <div className="dialog-footer-content"></div>
}

function Dialog(props: any): any {
    return <div className="r20es-dialog"></div>
}

function CheckboxWithText(_props: any): any {
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
