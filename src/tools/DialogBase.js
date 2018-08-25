import { DOM } from "./DOM";
import { removeAllChildren, findByIdAndRemove, safeCall } from "./MiscUtils";


class DialogBase {
    constructor(className, style, isStatic) {
        window.r20esDialogId = "r20esDialogId" in window ? window.r20esDialogId : 0;
        this._id = `r20es-dialog-${window.r20esDialogId++}`;
        this._root = <dialog className={className} style={style} id={this.getId()}/>;

        this.show = this.show.bind(this);
        this.close = this.close.bind(this);
        this.setData = this.setData.bind(this);
        this.getData = this.getData.bind(this);
        this.dispose = this.dispose.bind(this);
        this.isStatic = (isStatic === null ||isStatic === undefined) ? false : isStatic;

        if(this.isStatic) {
            this.internalRender();
        }

        document.body.insertBefore(this.getRoot(), document.body.firstElementChild);
        if(window.dialogPolyfill) dialogPolyfill.registerDialog(this.getRoot());
    }

    getRoot = _ => this._root;
    getId = _ => this._id;

    render() { }

    internalRender() {
        this.getRoot().appendChild(this.render());
        if(window.dialogPolyfill) dialogPolyfill.reposition(this.getRoot());
    }

    rerender() {
        if(this.isStatic) {
            console.error("Tried to rerender static dialog! Dialog cannot be static if it is to be redrawn.");
            return;
        }
        removeAllChildren(this.getRoot());
        this.internalRender();
    }

    show() {
        removeAllChildren(this.getRoot());
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
        const dialog = this.getRoot();
        if(dialog.open) {
            this.getRoot().close();
        }
        
    }

    dispose() {
        this.close();
        findByIdAndRemove(this.getId());
    }
}

export { DialogBase }
