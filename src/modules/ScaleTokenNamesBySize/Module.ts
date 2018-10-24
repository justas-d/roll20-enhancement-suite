import {R20Module} from "../../utils/R20Module"
import {Token} from "roll20";
import {R20} from "../../utils/R20";

class ScaleTokenNamesBySizeModule extends R20Module.OnAppLoadBase {
    public constructor() {
        super(__dirname);
    }

    private onSettingChange(name: string, oldVal: any, newVal: any) {
        R20.renderAll();
    }

    private drawNameplate = (token: Token, n: CanvasRenderingContext2D, textWidth: number, tokenHeight: number, fontSize: number, text: any) => {
        const cfg = this.getHook().config;

        try {
            let scale = token.attributes.width / cfg.widthThreshold;

            if(scale < 1 && !cfg.scaleIfSmaller) scale = 1;
            if(scale > 1 && !cfg.scaleIfLarger) scale = 1;

            const scaledFontSize = fontSize * scale;
            const scaledWidth = textWidth * scale;

            n.font = `bold ${scaledFontSize}px Arial`;
            n.fillStyle = "rgba(255,255,255,0.50)";

            const scaledBackplatePadY = 6 * scale;
            const scaledBackplatePadX = 5 * scale;

            const rectX = -1 * Math.ceil((scaledWidth + scaledBackplatePadX) / 2);
            const rectY = tokenHeight + 8;

            n.fillRect(rectX, rectY, scaledWidth + scaledBackplatePadX, scaledFontSize + scaledBackplatePadY);
            n.fillStyle = "rgb(0,0,0)";

            n.fillText(text || "", 0, rectY + scaledFontSize, scaledWidth);
        } catch (err) {
            console.error(err);
        }
    };

    public setup() {
        window.r20es.drawNameplate = this.drawNameplate;
    }

    public dispose() {
        window.r20es.drawNameplate = null;
    }
}

if (R20Module.canInstall()) new ScaleTokenNamesBySizeModule().install();
