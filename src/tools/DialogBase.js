import { createElementJsx } from "./DOM";
import { removeAllChildren, findByIdAndRemove } from "./MiscUtils";


class DialogBase {
    constructor(className, style) {
        window.r20esDialogId = "r20esDialogId" in window ? window.r20esDialogId : 0;
        this._id = `r20es-dialog-${window.r20esDialogId++}`;
        this._root = <dialog className={className} style={style} id={this.getId()}/>;

        this.show = this.show.bind(this);
        this.close = this.close.bind(this);

        document.body.insertBefore(this.getRoot(), document.body.firstElementChild);
        dialogPolyfill.registerDialog(this.getRoot());
    }

    getRoot = _ => this._root;
    getId = _ => this._id;

    render() { }

    internalRender() {
        this.getRoot().appendChild(this.render());
        dialogPolyfill.reposition(this.getRoot());
    }

    rerender() {
        removeAllChildren(this.getRoot());
        this.internalRender();
    }

    show() {
        this.internalRender();
        this.getRoot().showModal();
    }

    setData = data => this.returnData = data;
    getData = _ => { 
        const temp = this.returnData;
        this.returnData = null;
        return temp;
    }

    close() {
        removeAllChildren(this.getRoot());
        this.getRoot().close();
    }

    dispose() {
        findByIdAndRemove(this.getId());
    }

}

export { DialogBase }
