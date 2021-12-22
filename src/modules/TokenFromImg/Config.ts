import {TOKEN_FROM_IMG_BUTTON_NAME} from "./Constants"
import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "tokenFromUrl",
  name: "Create Token From URL",
  description: `Allows creating tokens on the canvas by right-clicking the canvas and pressing "${TOKEN_FROM_IMG_BUTTON_NAME}"`,
  gmOnly: true,

  category: VTTES.Module_Category.freedom,
};
