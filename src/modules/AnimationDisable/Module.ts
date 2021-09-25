import {R20Module} from "../../utils/R20Module"
import {createCSSElement, findByIdAndRemove} from "../../utils/MiscUtils";

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

#radial-menu .markermenu {
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

  /*
    private togglePageToolbar() {
        const toolbar = document.querySelector("#page-toolbar") as any;
        const isOpen = toolbar.classList.contains("closed");

        if (isOpen) {
            $("#page-toolbar .pages").show();
            toolbar.style.top = "0";
            toolbar.classList.remove("closed");
        } else {
            $("#page-toolbar .pages").hide();
            toolbar.style.top = `-${String(toolbar.clientHeight)}px`;

            toolbar.classList.add("closed");
        }
    }
    */

    install() {
        //window.r20es.togglePageToolbar = this.togglePageToolbar;
    }

    uninstall() {
        //window.r20es.togglePageToolbar = null;
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

    shouldDoCustomAnim(key: string) {
        const isNotObj = (obj: any): boolean => typeof(obj) !== "object";
        if (isNotObj(window.r20es)) return false;
        if (isNotObj(window.r20es.hooks)) return false;
        if (isNotObj(window.r20es.hooks.animationDisable)) return false;
        if (isNotObj(window.r20es.hooks.animationDisable.config)) return false;
        const val = window.r20es.hooks.animationDisable.config[key];
        if (typeof(val) !== "boolean") return false;
        return val;
    }

    installAnimMod(key: string) {
        const data = this.getAnimModData(key);
        if (!data) return;

        console.log(`installing anim mod ${key}`);

        data.install();
        this.installedAnims.push(key);
    }

    uninstallAnimMod(key: string) {
        const data = this.getAnimModData(key);
        if (!data) return;

        console.log(`removing anim mod ${key} ${data}`);

        data.uninstall();
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
        window.r20es.shouldDoCustomAnim = this.shouldDoCustomAnim;

        const cfg = this.getHook().config;

        for (const key in this.animModTable) {
            if (!cfg[key]) continue;
            this.installAnimMod(key);
        }
    }

    dispose() {
        window.r20es.shouldDoCustomAnim = null;

        super.dispose();
        for (const key of this.installedAnims) {
            this.uninstallAnimMod(key);
        }
    }
}

export default () => {
  new AnimationDisableModule().install();
};

