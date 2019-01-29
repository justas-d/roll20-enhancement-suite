import {R20Module} from "../../utils/R20Module"
import {CanvasObject} from "roll20";
import {R20} from "../../utils/R20";

class ScaleTokenNamesBySizeModule extends R20Module.OnAppLoadBase {
    public constructor() {
        super(__dirname);
    }

    private onSettingChange(name: string, oldVal: any, newVal: any) {
        R20.renderAll();
    }

    private prepNameplate = (token: CanvasObject, e: CanvasRenderingContext2D) => {
        const cfg = this.getHook().config;

        try {
            let scale = token.width / cfg.widthThreshold;

            if (scale < 1 && !cfg.scaleIfSmaller) scale = 1;
            if (scale > 1 && !cfg.scaleIfLarger) scale = 1;

            const scaledFontSize = token._nameplate_data.font_size * scale;
            e.font = `bold ${scaledFontSize}px Arial`;

            const width = e.measureText(token._nameplate_data.name).width;
            const t = token.height / 2;
            const n = e.measureText("M").width;

            token._nameplate_data.position = [-width / 2 - token._nameplate_data.padding, t + token._nameplate_data.vertical_offset];
            token._nameplate_data.size = [width + 2 * token._nameplate_data.padding, n + 2 * token._nameplate_data.padding];
        }
        catch (err) {
            console.error(err);
        }
    };

    public setup() {
        window.r20es.prepNameplate = this.prepNameplate;
        R20.renderAll();
    }

    public dispose() {
        window.r20es.prepNameplate = undefined;
        R20.renderAll();
    }
}

if (R20Module.canInstall()) new ScaleTokenNamesBySizeModule().install();
