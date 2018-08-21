import { R20 } from "./R20";

class LayerData {
    constructor(selector, bigTxt, txt, bgValues) {
        this.selector = selector;
        this.bigTxt = bigTxt;
        this.txt = txt;
        this.bgValues = bgValues;
    }

    makeBgStyle(alpha) {
        return `rgba(${this.bgValues[0]}, ${this.bgValues[1]}, ${this.bgValues[2]}, ${alpha})`;
    }
}

function getLayerData(layer) {
    if (layer === R20.layer.map)                    return new LayerData("#editinglayer li.choosemap", "Map Background", "MP", [255, 255, 0]);
    else if (layer === R20.layer.playerTokens)      return new LayerData("#editinglayer li.chooseobjects","Tokens (Player Visible)","TK",[255, 0, 0]);
    else if (layer === R20.layer.gmTokens)          return new LayerData("#editinglayer li.choosegmlayer","Game Master Tokens","GM",[0, 255, 0]);

    return new LayerData("",layer,layer,[255, 255, 255]);
}

export { getLayerData }
