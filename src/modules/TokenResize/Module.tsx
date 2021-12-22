import {R20Module} from "../../utils/R20Module";
import {R20} from "../../utils/R20";
import {TokenContextMenu} from "../../utils/TokenContextMenu";
import TokenResizeDialog from "./TokenResizeDialog";
import {scaleToFit} from "../../utils/FitWithinTools";
import {TOKEN_CONTEXT_MENU_ORDER_RESIZE_FIT, TOKEN_CONTEXT_MENU_ORDER_RESIZE_CUSTOM} from '../TokenContextMenuApi/Constants'

class TokenResizeModule extends R20Module.SimpleBase {

    private resizeDialog: TokenResizeDialog;

    public constructor() {
        super(__dirname);
    }

    private tryPlaceTopLeft = (obj: Roll20.CanvasObject) => {
        if(!this.getHook().config.placeTopLeft) return;

        R20.setCanvasObjectLocation(obj, obj.width / 2, obj.height/ 2);

    };

    private clickResizeFit = (e) => {
        const objects = R20.getSelectedTokens();
        const page = R20.getCurrentPage();
        R20.unselectTokens();

        const squareSize = 70;

        for (const obj of objects) {

            const fit = scaleToFit(obj._element.width, obj._element.height, page.attributes.width * squareSize, page.attributes.height * squareSize);

            R20.setCanvasObjectDimensions(obj, fit.x, fit.y);
            this.tryPlaceTopLeft(obj);
        }


        R20.renderAll();
    };

    private clickResizeCustom = (e) => {

        this.resizeDialog.show(this.getHook(), (moveTokens: boolean) => {

            const config = this.getHook().config;
            if(config.lastSquareWidth == 0 || config.lastSquareHeight == 0|| config.lastNumSquaresX == 0|| config.lastNumSquaresY == 0) {
                alert("Invalid input: one of the values was zero.");
                return;
            }

            const objects = R20.getSelectedTokens();

            R20.unselectTokens();

            for (const obj of objects) {

                let width = config.lastSquareWidth * config.lastNumSquaresX;
                let height = config.lastSquareHeight * config.lastNumSquaresY;

                if(config.useUnits) {
                    const page = R20.getCurrentPage();
                    width /= page.attributes.scale_number;
                    height /= page.attributes.scale_number;
                }

                R20.setCanvasObjectDimensions(obj, width, height);

                if(moveTokens) {
                    this.tryPlaceTopLeft(obj);
                }
            }

            R20.renderAll();
        });
    };


    public setup() {
        this.resizeDialog = new TokenResizeDialog();

        TokenContextMenu.addButton("Resize Fit", this.clickResizeFit, TOKEN_CONTEXT_MENU_ORDER_RESIZE_FIT, {
            mustHaveSelection: true
        });

        TokenContextMenu.addButton("Resize Custom", this.clickResizeCustom, TOKEN_CONTEXT_MENU_ORDER_RESIZE_CUSTOM, {
            mustHaveSelection: true
        });
    }

    public dispose() {
        if(this.resizeDialog) this.resizeDialog.dispose();

        TokenContextMenu.removeButton("Resize Fit", this.clickResizeFit);
        TokenContextMenu.removeButton("Resize Custom", this.clickResizeCustom);
    }
}

export default () => {
  new TokenResizeModule().install();
};

