import {R20Module} from '../../tools/R20Module'
import {DOM} from '../../tools/DOM';
import {createCSSElement, findByIdAndRemove, getExtUrlFromPage} from '../../tools/MiscUtils';

class DarkModeModule extends R20Module.OnAppLoadBase {
    private static readonly styleId = "r20es-dark-mode-style-id";

    private urlPromise: Promise<string>;
    private styleUrl: string;

    constructor() {
        super(__dirname);
        this.urlPromise = getExtUrlFromPage("darkMode.css", 5000)
    }

    private createWidgetImmediately() {
        const widget = <link rel="stylesheet" type="text/css" href={this.styleUrl} id={DarkModeModule.styleId}/>;
        document.head.appendChild(widget);
    }

    private createWidget() {
        if(!this.styleUrl) {
            this.urlPromise
                .then(url => {
                    this.styleUrl = url;
                    this.createWidgetImmediately();
                })
                .catch(console.log);
        } else {
            this.createWidgetImmediately();
        }
    }

    private removeWidget() {
        findByIdAndRemove(DarkModeModule.styleId);

    }

    public onSettingChange(name, oldVal, newVal) {
        this.removeWidget();
        this.createWidget();
    }

    public setup() {
        this.createWidget();
    }

    public dispose() {
        super.dispose();
        this.removeWidget();
    }
}

if (R20Module.canInstall()) new DarkModeModule().install();
