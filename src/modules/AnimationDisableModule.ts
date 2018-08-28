import { R20Module } from "../tools/R20Module"
import { createCSSElement, findByIdAndRemove } from "../tools/MiscUtils";

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

class AnimationDisableModule extends R20Module.OnAppLoadBase {
    private installedAnims: string[] = [];
    private animModTable: { [index: string]: IAnimationMod } = {};

    constructor() {
        super(__filename);
        this.animModTable["disableRadial"] = new NoAnimTokenRadial();
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

const hook = R20Module.makeHook(__filename, {
    id: "animationDisable",
    name: "Disable Animations",
    description: "Disables animations that can be configured in the options section.",
    category: R20Module.category.canvas,
    media: {
        "no_radial_anim.webm": "No token radial menu animation"
    },

    mods: [
        { // radial button proportionally timed animation
            includes: "assets/app.js",
            find: `setTimeout(function(){$(e).addClass("open"),o.find(".button div.hasnumber").textfill(20)},30*a),a++`,
            patch: `;
            if(window.r20esanims && window.r20esanims.disableRadial) { $(e).addClass("open");o.find(".button div.hasnumber").textfill(20);}
            else { >>R20ES_MOD_FIND>>; }`,
        },

        { // radial final
            includes: "assets/app.js",
            find: `setTimeout(function(){o.find(".button").addClass("animcomplete")},250)`,
            patch: `1;
            if(window.r20esanims && window.r20esanims.disableRadial) { o.find(".button").addClass("animcomplete");}
            else { >>R20ES_MOD_FIND>>; }`,
        },

        { // marker menu hide
            includes: "assets/app.js",
            find: `setTimeout(function(){p&&p.remove()},300)`,
            patch: `1;
            if(window.r20esanims && window.r20esanims.disableRadial) { p && p.remove(); }
            else { >>R20ES_MOD_FIND>>; }`,
        },

        { // marker menu show
            includes: "assets/app.js",
            find: `_.delay(function(){d.addClass("open")})`,
            patch: `1;
            if(window.r20esanims && window.r20esanims.disableRadial) { d.addClass("open"); }
            else { >>R20ES_MOD_FIND>>; }`
        }
    ],

    configView: {
        disableRadial: {
            type: "checkbox",
            display: "Disable token radial button menu animations"
        }
    },

    config: {
        disableRadial: false,
    },
});

export { hook as AnimationDisableHook }
