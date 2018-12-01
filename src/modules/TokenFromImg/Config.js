import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import {TOKEN_FROM_IMG_BUTTON_NAME} from "./Constants"

export default MakeConfig(__dirname, {
    id: "tokenFromUrl",
    name: "Create Token From URL",
    description: `Allows creating tokens on the canvas by right-clicking the canvas and pressing "${TOKEN_FROM_IMG_BUTTON_NAME}"`,
    category: Category.canvas,
});
