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

    getScale = (token: CanvasObject) => {
        const cfg = this.getHook().config;
        let scale = token.width / cfg.widthThreshold;

        if (scale < 1 && !cfg.scaleIfSmaller) scale = 1;
        if (scale > 1 && !cfg.scaleIfLarger) scale = 1;

        return scale;
    };

    private prepNameplateBack = (token: CanvasObject, e: CanvasRenderingContext2D) => {
        try {
            const cfg = this.getHook().config;
            let scale = this.getScale(token);

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

    private prepNameplateText = (token: CanvasObject, e: CanvasRenderingContext2D) => {
        try {
            let scale = this.getScale(token) - 1;
            token._nameplate_data.position[1] += token._nameplate_data.font_size * scale;
        }
        catch (err) {
            console.error(err);
        }
    };

    public setup() {
        window.r20es.prepNameplateBack = this.prepNameplateBack;
        window.r20es.prepNameplateText= this.prepNameplateText;
        R20.renderAll();
    }

    public dispose() {
        window.r20es.prepNameplateBack = undefined;
        window.r20es.prepNameplateText= undefined;

        R20.renderAll();
    }
}

if (R20Module.canInstall()) new ScaleTokenNamesBySizeModule().install();
