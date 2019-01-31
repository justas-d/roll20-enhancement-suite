import { R20Module } from "../../utils/R20Module"
import { createCSSElement, findByIdAndRemove } from "../../utils/MiscUtils";

class AlternativeRadialMenuModule extends R20Module.OnAppLoadBase {

    readonly sheetId: string = "r20es-alternative-radial-menu-sheet";

    constructor() {
        super(__dirname);
    }

    onSettingChange(name: string, oldVal: any, newVal: any) {
        this.removeStyle();
        this.addStyle();
    }

    addStyle() {
        const cfg = this.getHook().config;
        console.log(cfg);
        let style = `

#radial-menu .button {
    position: static;
    height: auto;
    width: 60px;
    border-radius: 0px;
    border: none;
    
}

#radial-menu .button.open {
    opacity: ${cfg.opacity};
}

#radial-menu .button-1, 
#radial-menu .button-2,
#radial-menu .button-6 {
    transform: translateX(-65px) translateY(-14px);
    z-index: 5;
}

#radial-menu .button-6 {
    transform: translateX(-65px) translateY(-105px);
}

#radial-menu .button-3, 
#radial-menu .button-4,
#radial-menu .button-5 {
    transform: translateX(75px) translateY(-75px);
}

#radial-menu .button div.inner {
    margin: 0px;
    border-radius: 0px;
}

#radial-menu .markermenu.open {
    border-radius: 0;
    top: 47px;
    padding-left: 0;
    left: -80px;
    width: 375px;
    height: auto;
}

`;

        if (cfg.superMinimal) {
            style += `
}
#radial-menu .markermenu.open {
    left: -55px;
    width: 260px;
}
#radial-menu .button div.inner {
    background: rgba(0,0,0,0);
}
#radial-menu .button {
    width: 30px;
}

#radial-menu .button-1, 
#radial-menu .button-2 {
    transform: translateX(-35px) translateY(-14px);
}

#radial-menu .button-6 {
    transform: translateX(-35px) translateY(-105px);
}

#radial-menu .button div.inner.hasnumber span {
    text-shadow: 0px 0px 3px rgba(0,0,0,1);
    text-shadow: 1px 1px 0px rgba(0,0,0,1);
}

#radial-menu .markermenu .markercolor {
    width: 20px;
    height: 20px;
}

#radial-menu .markermenu .markercolor,
#radial-menu .markermenu .markericon {
    margin: 0;
    border: 2px solid white;
}

#radial-menu .markermenu .markercolor.active,
#radial-menu .markermenu .markericon.active {
    border: 2px solid black;

}

`
        }


        const el = createCSSElement(style, this.sheetId);
        document.body.appendChild(el);
    }

    removeStyle() {
        findByIdAndRemove(this.sheetId);
    }

    setup() {
        this.addStyle();
    }

    dispose() {
        this.removeStyle();
    }

}

if (R20Module.canInstall()) new AlternativeRadialMenuModule().install();
