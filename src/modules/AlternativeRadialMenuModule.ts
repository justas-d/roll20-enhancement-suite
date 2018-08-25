import { R20Module } from "../tools/R20Module"
import { createCSSElement, findByIdAndRemove } from "../tools/MiscUtils";

class AlternativeRadialMenuModule extends R20Module.OnAppLoadBase {

    readonly sheetId: string = "r20es-alternative-radial-menu-sheet";

    constructor() {
        super(__filename);
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
#radial-menu .button-2 {
    transform: translateX(-65px);
    z-index: 5;
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
`;

        if (cfg.superMinimal) {
            style += `
            
#radial-menu .button div.inner {
    background: rgba(0,0,0,0);
}
#radial-menu .button {
    width: 30px;
}

#radial-menu .button-1, 
#radial-menu .button-2 {
    transform: translateX(-35px);
    z-index: 5;
}

#radial-menu .button div.inner.hasnumber span {
    text-shadow: 0px 0px 3px rgba(0,0,0,1);
    text-shadow: 1px 1px 0px rgba(0,0,0,1);
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

const hook = R20Module.makeHook(__filename, {
    id: "alternativeRadialMenu",
    name: "Alternative Token Radial Menu",
    description: "Replaces the default token radial token menu with a more compact and simplistic one.",
    category: R20Module.category.canvas,

    configView: {
        opacity: {
            type: "slider",
            display: "Opacity",

            sliderMin: 0,
            sliderMax: 1
        },

        superMinimal: {
            type: "checkbox",
            display: "Compact mode",
        }
    },

    config: {
        opacity: 1,
        superMinimal: false,
    }
});

export { hook as AlternativeRadialMenuHook }
