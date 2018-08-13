import { R20 } from "./R20";

function getLayerData(layer) {
    if (layer === R20.layer.map) return {
        selector: "#editinglayer li.choosemap",
        bigTxt: "Map Background",
        txt: "MP",
        bg: "rgba(255,255,0,0.5)"
    }

    else if (layer === R20.layer.playerTokens) return {
        selector: "#editinglayer li.chooseobjects",
        bigTxt: "Tokens (Player Visible)",
        txt: "TK",
        bg: "rgba(255,0,0,0.5)"
    }
    else if (layer === R20.layer.gmTokens) return {
        selector: "#editinglayer li.choosegmlayer",
        bigTxt: "Game Master Tokens",
        txt: "GM",
        bg: "rgba(0,255,0,0.5)"
    }
    
    return {
        selector: "",
        bigTxt: layer,
        txt: layer,
        bg: "rgba(255,255,255,0.5)"
    }
}

export { getLayerData }
