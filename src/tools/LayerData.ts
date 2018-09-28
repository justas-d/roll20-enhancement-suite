import { R20 } from "./R20";

interface RGBColor {
    red: number;
    green: number;
    blue: number;
}

class LayerData {
    public selector: string;
    public bigTxt: string;
    public txt: string;
    public bgValues: RGBColor;

    private constructor(selector: string, bigTxt: string, txt: string, bgValues: RGBColor) {
        this.selector = selector;
        this.bigTxt = bigTxt;
        this.txt = txt;
        this.bgValues = bgValues;
    }

    public makeBgStyle(alpha) {
        return `rgba(${this.bgValues.red}, ${this.bgValues.green}, ${this.bgValues.blue}, ${alpha})`;
    }

    static getLayerData(layer: R20.CanvasLayer) {
        if (layer === R20.CanvasLayer.Map)
            return new LayerData("#editinglayer li.choosemap", "Page Background", "MP", { red: 255, green: 255, blue: 0 });

        else if (layer === R20.CanvasLayer.PlayerTokens)
            return new LayerData("#editinglayer li.chooseobjects", "Tokens (Player Visible)", "TK", { red: 255, green: 0, blue: 0 });

        else if (layer === R20.CanvasLayer.GMTokens)
            return new LayerData("#editinglayer li.choosegmlayer", "Game Master Tokens", "GM", { red: 0, green: 255, blue: 0 });
        else if (layer === R20.CanvasLayer.Lighting)
            return new LayerData("#editinglayer li.choosewalls", "Lighting", "LG", { red: 0, green: 255, blue: 255 });

        return new LayerData("", layer, layer, { red: 255, green: 255, blue: 255 });
    }
}

export { LayerData }
