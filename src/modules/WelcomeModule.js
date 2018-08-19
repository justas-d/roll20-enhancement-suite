import { R20Module } from "../tools/R20Module";
import { DOM } from "../tools/DOM";

class Welcome extends DOM.ElementBase {
    constructor(mod) {
        super();

        this.mod = mod;;
        this.curStage = 0;
        this.stages = [
            {
                heading: "Welcome to Roll20 Enhancement Suite!",
                paragraphs: [
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",

                    "Do you us to give you a quick tour?"
                ],
                init: true
            },

            {
                heading: "The Settings Menu",
                paragraphs: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."]
            },

            {
                heading: "The Settings Menu",
                paragraphs: ["NUMBER TWO Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."]
            },
        ];

        this.onClickClose = this.onClickClose.bind(this);
        this.onClickLater = this.onClickLater.bind(this);
        this.onClickNext = this.onClickNext.bind(this);
    }

    close() {
        this.dispose();
    }

    finish() {
        const hook = this.mod.getHook();
        hook.config.hasSeen = true;
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
        console.log("clicked");
        this.curStage++;

        if(this.curStage >= this.stages.length) {
            this.finish();
        } else {
            this.rerender();
        }
    }

    internalRender() {

        const data = this.stages[this.curStage];

        const style = {
            backgroundColor: "#ffffff",
            maxWidth: "30%",
            right: "5%",
            top: "5%",
            position: "absolute",
            padding: "10px",
            zIndex: "10000"
        };
        const isInit = "init" in data && data.init;

        return (


            <div style={style}>
                <h3>{data.heading}</h3>

                    {data.paragraphs.map(txt => <p>{txt}</p>)}
                {isInit &&
                    <div>
                        <button onClick={this.onClickClose} >Never</button>
                        <button onClick={this.onClickLater}>Later</button>
                        <button onClick={this.onClickNext}>Let's go!</button>

                    </div>
                }

                {!isInit &&
                    <div>
                        <button onClick={this.onClickClose}>Dismiss</button>
                        <button onClick={this.onClickNext}>Next</button>
                    </div>
                }

            </div>
        );
    }
}
class WelcomeModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__filename);
    }

    setup() {
        if(this.getHook().config.hasSeen) return;

        this.welcome = new Welcome(this);

        const root = document.getElementById("playerzone");
        root.parentElement.insertBefore(this.welcome.render(), root);
    }

    dispose() {
        if(this.welcome) this.welcome.dispose();

    }
}

if (R20Module.canInstall()) new WelcomeModule().install();

const hook = R20Module.makeHook(__filename, {
    id: "welcomeScreen",
    force: true,

    config: {
        hasSeen: false
    },
});

export { hook as WelcomeModule };
