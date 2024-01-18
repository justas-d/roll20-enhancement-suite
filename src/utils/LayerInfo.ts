import {R20} from "./R20";

export interface ILayerInfo {
    readonly bigTxt: string;
    readonly txt: string;
    readonly bgColors: number[];
    readonly toolName: string;
}

export const layerInfo: { [id: string]: ILayerInfo } = {
    [R20.CanvasLayer.Map]: {
        bigTxt: "Page Background",
        txt: "MP",
        bgColors: [255, 255, 0],
        toolName: "choosemap",
    },

    [R20.CanvasLayer.PlayerTokens]: {
        bigTxt: "Tokens (Player Visible)",
        txt: "TK",
        bgColors: [255, 0, 0],
        toolName: "chooseobjects",
    },

    [R20.CanvasLayer.GMTokens]: {
        bigTxt: "Game Master Tokens",
        txt: "GM",
        bgColors: [0, 255, 0],
        toolName: "choosegmlayer",
    },

    [R20.CanvasLayer.Lighting]: {
        bigTxt: "Lighting",
        txt: "LG",
        bgColors: [0, 255, 255],
        toolName: "choosewalls",
    },

    [R20.CanvasLayer.B20Foreground]: {
        bigTxt: "Page Foreground",
        txt: "FG",
        bgColors: [229, 137, 25],
        toolName: "chooseforeground",
    },

    [R20.CanvasLayer.B20Weather]: {
        bigTxt: "Weather",
        txt: "WH",
        bgColors: [65, 24, 229],
        toolName: "chooseweather",
    },
    [R20.CanvasLayer.B20Background]: {
        bigTxt: "B20 Background",
        txt: "BG",
        bgColors: [208, 69, 247],
        toolName: "choosebackground",
    },
};

