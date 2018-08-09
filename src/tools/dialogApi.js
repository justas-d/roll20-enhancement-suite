import { createElement } from "./createElement";
import { removeAllChildren, findByIdAndRemove } from "./miscUtil";

class DialogBase {
    constructor() {
        window.r20esDialogId = "r20esDialogId" in window ? window.r20esDialogId : 0;
        this.numId = window.r20esDialogId++;
        this.id = `r20es-dialog-${this.numId}`;
        this.root = createElement("dialog", {id: this.id});

        this.show = this.show.bind(this);
        this.close= this.close.bind(this);

        //document.body.appendChild(this.root);
        document.body.insertBefore(this.root, document.body.firstElementChild);
        dialogPolyfill.registerDialog(this.root);
    }

    render() {}

    show() {
        this.root.appendChild(this.render());
        this.root.showModal();
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