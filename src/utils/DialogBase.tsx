import { DOM } from "./DOM";
import { removeAllChildren, findByIdAndRemove } from "./MiscUtils";

abstract class DialogBase<T> {
    private centerWorkaround: boolean;
    private _id: string;
    private _root: HTMLDialogElement;
    private returnData: T;
    private success: boolean = false;

    constructor(className?: string, style?: any, centerWorkaround?: boolean) {
        window["r20esDialogId"] = "r20esDialogId" in window ? window["r20esDialogId"] : 0;
        
        this.centerWorkaround = (centerWorkaround === null || centerWorkaround === undefined) ? false : centerWorkaround;

        this._id = `r20es-dialog-${window["r20esDialogId"]++}`;
        this._root = <dialog className={className} style={style} id={this.getId()} /> as any;

        document.body.insertBefore(this.getRoot(), document.body.firstElementChild);

        if (window["dialogPolyfill"]) {
            window["dialogPolyfill"].registerDialog(this.getRoot());
        }

        this.close = this.close.bind(this);
        this.dispose = this.dispose.bind(this);
    }

    public getRoot = () => this._root;
    public getId = () => this._id;

    public isSuccessful = () => this.success;

    protected abstract render(): HTMLElement;

    private internalRender() {
        this.getRoot().appendChild(this.render());
        if (window["dialogPolyfill"]) {
            window["dialogPolyfill"].reposition(this.getRoot());
        }

        if (this.centerWorkaround) {
            setTimeout(() => {
                this.recenter();
            }, 100);
        }
    }

    public recenter() {
      /*
        const el = this.getRoot();
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        const topValue = scrollTop + (window.innerHeight - el.offsetHeight) / 2;
        el.style.top = Math.max(scrollTop, topValue) + 'px';
        */
    }

    public rerender() {
        removeAllChildren(this.getRoot());
        this.internalRender();
    }

    protected internalShow() {
        removeAllChildren(this.getRoot());
        this.success = false;
        this.internalRender();
        this.getRoot().showModal();
    }

    protected setData = (data: T) => this.returnData = data;
    public getData(): T {
        const temp = this.returnData;
        this.returnData = null;
        return temp;
    }



    public close(success: boolean = false) {
        if(typeof(success) !== "boolean") {
            this.success = false;
        } else {
            this.success = success;
        }
        
        const dialog = this.getRoot();
        if (dialog.open) {
            this.getRoot().close();
        }
    }

    public dispose() {
        this.close();
        findByIdAndRemove(this.getId());
    }
}

export { DialogBase }
