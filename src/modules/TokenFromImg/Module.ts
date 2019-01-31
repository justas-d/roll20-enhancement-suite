import {R20Module} from "../../utils/R20Module"
import {TokenContextMenu} from "../../utils/TokenContextMenu";
import {TOKEN_FROM_IMG_BUTTON_NAME} from "./Constants"
import {R20} from "../../utils/R20";

class TokenFromImgModule extends R20Module.OnAppLoadBase {

    constructor() {
        super(__dirname);
    }

    private onButtonClick = () => {
        const mousePos = R20.getCanvasMousePos();
        const pageId = R20.getCurrentPage().id;
        const layer = R20.getCurrentLayer();

        const url = window.prompt("Enter a URL", "www.example.com/image.png");

        if(!url) {
            return;
        }

        const img = new Image();
        img.onload = () => {

            const toCreate = {
                left: mousePos[0],
                top: mousePos[1],
                width: img.width,
                height: img.height,
                z_index: 0,
                imgsrc: url,
                rotation: 0,
                type: "image",
                page_id: pageId,
                layer,
                id: R20.generateUUID()
            };

            R20.getCurrentPage().thegraphics.create(toCreate);
        };

        img.onerror = (...err) => {

            const toCreate = {
                left: mousePos[0],
                top: mousePos[1],
                width: 70,
                height: 70,
                z_index: 0,
                imgsrc: url,
                layer: layer,
            };

            R20.getCurrentPage().addImage(toCreate);
        };

        img.src = url;
    };

    public setup() {
        TokenContextMenu.addButton(TOKEN_FROM_IMG_BUTTON_NAME, this.onButtonClick);
    }

    public dispose() {
        TokenContextMenu.removeButton(TOKEN_FROM_IMG_BUTTON_NAME, this.onButtonClick);
        super.dispose();
    }
}

if (R20Module.canInstall()) new TokenFromImgModule().install();
