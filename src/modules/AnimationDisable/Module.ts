import { R20Module } from "../../tools/R20Module"
import { createCSSElement, findByIdAndRemove } from "../../tools/MiscUtils";

interface IAnimationMod {
    install();
    uninstall();
}

class NoAnimTokenRadial implements IAnimationMod {

    readonly sheetId = "r20es-anim-no-token-radial";

    install() {
        const style = createCSSElement(`
#radial-menu .button {
    -webkit-transition: none;
    -moz-transition: none;
    -o-transition: none;
    -ms-transition:none;
    transition:none;
}

#radial-menu .button.open {
    -webkit-transition-timing-function: none;
    -webkit-transition-timing-function: none;
    -moz-transition-timing-function: none;
    -ms-transition-timing-function: none;
    -o-transition-timing-function: none;
    transition-timing-function: none;
}`, this.sheetId);

        document.body.appendChild(style);

    }

    uninstall() {
        findByIdAndRemove(this.sheetId);
    }
}

class NoPageToolbarAnim implements IAnimationMod {

    private togglePageToolbar() {
        const toolbar = document.querySelector("#page-toolbar") as any;
        const isOpen = toolbar.classList.contains("closed");
        console.log(`toggling ${isOpen}`);

        if(isOpen) {
            $("#page-toolbar .pages").show();
            toolbar.style.top = "0";
            toolbar.classList.remove("closed");
        } else {
            $("#page-toolbar .pages").hide();
            toolbar.style.top = `-${String(toolbar.clientHeight)}px`;

            toolbar.classList.add("closed");
        }
    }

    install() {
        window.r20es.togglePageToolbar = this.togglePageToolbar;
    }

    uninstall() {
        window.r20es.togglePageToolbar = null;
    }

}

class AnimationDisableModule extends R20Module.OnAppLoadBase {
    private installedAnims: string[] = [];
    private animModTable: { [index: string]: IAnimationMod } = {};

    constructor() {
        super(__dirname);
        this.animModTable["disableRadial"] = new NoAnimTokenRadial();
        this.animModTable["disablePageToolbar"] = new NoPageToolbarAnim();
    }


    getAnimModData(key: string) {
        if (!(key in this.animModTable)) {
            console.error(`Could not find anim mod data for key ${key}`);
            return null;
        }
        const data = this.animModTable[key];
        console.log(data);

        return data;
    }

    installAnimMod(key: string) {
        const data = this.getAnimModData(key);
        if (!data) return;

        console.log(`installing anim mod ${key}`);
        
        data.install();
        window["r20esanims"][key] = true;

        this.installedAnims.push(key);
    }

    uninstallAnimMod(key: string) {
        const data = this.getAnimModData(key);
        if (!data) return;
        
        console.log(`removing anim mod ${key} ${data}`);

        data.uninstall();
        window["r20esanims"][key] = false;
        
        {
            const idx = this.installedAnims.indexOf(key);
            if (idx >= 0) {
                this.installedAnims.splice(idx, 1);
            }
        }
    }

    onSettingChange(name: string, oldVal: any, newVal: any) {
        if (oldVal === newVal) return;

        newVal
            ? this.installAnimMod(name)
            : this.uninstallAnimMod(name);
    }

    setup() {
        const cfg = this.getHook().config;

        window["r20esanims"] = window["r20esanims"] || {};
        for (const key in this.animModTable) {
            if(!cfg[key]) continue;
            this.installAnimMod(key);
        }
    }

    dispose() {
        super.dispose();
        for (const key of this.installedAnims) {
            this.uninstallAnimMod(key);
        }
    }
}

if (R20Module.canInstall()) new AnimationDisableModule().install();
