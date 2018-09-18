import {R20Module} from "../../tools/R20Module";
import {R20} from "../../tools/R20";
import {TokenContextMenu} from "../../tools/TokenContextMenu";
import TokenResizeDialog from "./TokenResizeDialog";
import {CanvasObject} from "roll20";

class TokenResizeModule extends R20Module.SimpleBase {

    private resizeDialog: TokenResizeDialog;

    public constructor() {
        super(__dirname);
    }

    private tryPlaceTopLeft = (obj: CanvasObject) => {
        if(!this.getHook().config.placeTopLeft) return;

        R20.setCanvasObjectLocation(obj, obj.width / 2, obj.height/ 2);

    };

    private clickResizeFit = (e) => {
        const objects = R20.getSelectedTokens();
        const page = R20.getCurrentPage();
        R20.unselectTokens();

        const squareSize = 70;

        for (const obj of objects) {

            const smaller = obj._element.width > obj._element.height ? "height" : "width";
            const bigger = obj._element.width > obj._element.height ? "width" : "height";

            const ratio = obj._element[smaller] / obj._element[bigger];
            const biggerVal = page.attributes[bigger] * squareSize;
            const smallerVal = biggerVal * ratio;

            const data: any = {
                [bigger]: biggerVal,
                [smaller]: smallerVal,
            };

            R20.setCanvasObjectDimensions(obj, data.width, data.height);
            this.tryPlaceTopLeft(obj);
        }


        R20.renderAll();
    };

    private clickResizeCustom = (e) => {

        this.resizeDialog.show(this.getHook(), () => {
            const objects = R20.getSelectedTokens();
            const config = this.getHook().config;
            R20.unselectTokens();

            for (const obj of objects) {

                const width = config.lastSquareWidth * config.lastNumSquaresX;
                const height = config.lastSquareHeight * config.lastNumSquaresY;

                R20.setCanvasObjectDimensions(obj, width, height);
                this.tryPlaceTopLeft(obj);
            }

            R20.renderAll();
        });
    };


    public setup() {
        this.resizeDialog = new TokenResizeDialog();

        TokenContextMenu.addButton("Resize Fit", this.clickResizeFit, {
            mustHaveSelection: true
        });

        TokenContextMenu.addButton("Resize Custom", this.clickResizeCustom, {
            mustHaveSelection: true
        });
    }

    public dispose() {
        if(this.resizeDialog) this.resizeDialog.dispose();

        TokenContextMenu.removeButton("Resize Fit", this.clickResizeFit);
        TokenContextMenu.removeButton("Resize Custom", this.clickResizeCustom);
    }
}

if (R20Module.canInstall()) new TokenResizeModule().install();
