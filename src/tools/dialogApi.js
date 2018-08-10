import { createElement } from "./createElement";
import { removeAllChildren, findByIdAndRemove } from "./miscUtil";


class DialogBase {
    constructor(className) {
        window.r20esDialogId = "r20esDialogId" in window ? window.r20esDialogId : 0;
        this.numId = window.r20esDialogId++;
        this.id = `r20es-dialog-${this.numId}`;
        this.root = createElement("dialog", { className: className, id: this.id });

        this.show = this.show.bind(this);
        this.close = this.close.bind(this);

        document.body.insertBefore(this.root, document.body.firstElementChild);
        dialogPolyfill.registerDialog(this.root);
    }

    render() { }

    internalRender() {
        this.root.appendChild(this.render());
        dialogPolyfill.reposition(this.root);
    }

    rerender() {
        removeAllChildren(this.root);
        this.internalRender();
    }

    show() {
        this.internalRender();
        this.root.showModal();
    }

    setData = data => this.returnData = data;
    getData = _ => { 
        const temp = this.returnData;
        this.returnData = null;
        return temp;
    }

    close() {
        removeAllChildren(this.root);
        this.root.close();
    }

    dispose() {
        findByIdAndRemove(this.id);
    }

}

export { DialogBase }