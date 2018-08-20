import { R20Module } from "../tools/R20Module";
import { DOM } from "../tools/DOM";

const welcomeStyle = {
    backgroundColor: "#ffffff",
    maxWidth: "30%",
    right: "20%",
    top: "5%",
    position: "absolute",
    padding: "10px",
    zIndex: "10000"
};

class Welcome extends DOM.ElementBase {
    constructor(mod) {
        super();

        this.mod = mod;
        this.onClickClose = this.onClickClose.bind(this);
        this.onClickLater = this.onClickLater.bind(this);
        this.onClickNext = this.onClickNext.bind(this);
    }

    close() {
        this.dispose();
    }

    finish() {
        const hook = this.mod.getHook();
        hook.config.showStartupGuide = false;
        hook.saveConfig();
        this.close();
    }

    onClickClose() {
        this.finish();
    }

    onClickLater() {
        this.close();
    }

    onClickNext() {
        this.finish();

        $("a[href='#mysettings']").click();
        const btn = document.getElementById(R20Module.getModuleById("pluginSettings").buttonId);
        const oldBorder = btn.style.border

        setTimeout(() => {
            btn.style.border = "solid red 5px";
        }, 500);

        setTimeout(() => {
            btn.style.border = oldBorder;
            $(btn).click();
        }, 1500);
    }

    internalRender() {

        const buttonStyle = { marginRight: "8px" };

        return (

            <div style={welcomeStyle}>
                <h3>Welcome to Roll20 Enhancement Suite!</h3>

                <p>To get started, we recommend taking a look at the settings menu. There you can discover, learn and configure the modules this plugin provides.</p>
                <p>It can be found underneath the "My Settings" tab in the sidebar.</p>
                <p>Would you like us to take you there?</p>

                <div style={{float: "right"}}>
                    <button className="btn" style={buttonStyle} onClick={this.onClickClose}>I'll figure it out</button>
                    <button className="btn" style={buttonStyle} onClick={this.onClickLater}>Later</button>
                    <button className="btn" style={buttonStyle} onClick={this.onClickNext}>Let's go!</button>

                </div>
            </div>
        );
    }
}

class ConfirmWorkingPopup extends DOM.ElementBase {

    constructor() {
        super();
        this.doDots = this.doDots.bind(this);
        this.onClick = this.onClick.bind(this);
        this.dots = <span></span>;
        this.sec = 0;

    }

    killMe() {
        if (this.interval) clearInterval(this.interval);
        this.dispose();
    }

    doDots() {
        this.sec++;
        this.dots.innerHTML = ` ${".".repeat(this.sec)}`;

        if (this.sec > 5) {
            this.killMe();
        }
    }

    onClick() {
        this.killMe();
    }

    internalRender() {
        this.interval = setInterval(this.doDots, 1000);

        return (
            <div style={welcomeStyle} onClick={this.onClick}>
                <span>R20ES has been loaded!</span>
                {this.dots}
            </div>
        );
    }
}

class WelcomeModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__filename);
    }

    setup() {

        const root = document.getElementById("playerzone");
        let elem = null;

        const cfg = this.getHook().config;

        if (cfg.showStartupGuide) {
            this.welcome = new Welcome(this);
            elem = this.welcome.render();
        } else if (cfg.showWelcomePopup) {
            this.popup = new ConfirmWorkingPopup();
            elem = this.popup.render();
        }

        if (elem) {
            root.parentElement.insertBefore(elem, root);
        } 
    }

    dispose() {
        if (this.welcome) this.welcome.dispose();
        if (this.popup) this.popup.dispose();
    }
}

if (R20Module.canInstall()) new WelcomeModule().install();

const hook = R20Module.makeHook(__filename, {
    name: "Welcome Notification",
    id: "welcomeScreen",
    force: true,
    forceShowConfig: true,
    category: R20Module.category.misc,

    configView: {
        showWelcomePopup: {
            display: "Show welcome popup",
            type: "checkbox"
        },

        showStartupGuide: {
            display: "Show startup guide",
            type: "checkbox"
        },
    },

    config: {
        showWelcomePopup: true,
        showStartupGuide: true
    },
});

export { hook as WelcomeModule };
