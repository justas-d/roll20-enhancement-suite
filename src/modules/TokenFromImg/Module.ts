import {R20Module} from "../../utils/R20Module"
import {TokenContextMenu} from "../../utils/TokenContextMenu";
import {TOKEN_FROM_IMG_BUTTON_NAME, TOKEN_FROM_ANIMATED_TOKEN_KEY, TOKEN_GET_URL} from "./Constants"
import {R20} from "../../utils/R20";
import {TOKEN_CONTEXT_MENU_ORDER_CREATE_TOKEN_BY_URL, TOKEN_CONTEXT_MENU_ORDER_GET_TOKEN_IMAGE_URL} from '../TokenContextMenuApi/Constants'

class TokenFromImgModule extends R20Module.OnAppLoadBase {

  constructor() {
    super(__dirname);
  }

  private ui_on_add_token_button_click = () => {
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
      const lowerUrl = url.toLowerCase();
      if(lowerUrl.includes(".webm") || lowerUrl.includes(".mp4")) {

        // probs a video
        const toCreate = {
          left: mousePos[0],
          top: mousePos[1],
          width: 70,
          height: 70,
          z_index: 0,
          imgsrc: url,
          layer: layer,
          [TOKEN_FROM_ANIMATED_TOKEN_KEY]: true,
        };

        R20.getCurrentPage().addImage(toCreate);
      }
    };

    img.src = url;
  };

  ui_on_get_token_img_url_button_click = () => {
    let tokens = R20.getSelectedTokens();
    let buffer = "";

    let has_clipboard_api = navigator && navigator["clipboard"] && navigator["clipboard"].writeText;

    for(let token_index = 0;
      token_index < tokens.length;
      ++token_index
    ) {
      let token = tokens[token_index];

      const model =R20.try_get_canvas_object_model(token);

      if(model && model.attributes.imgsrc) {
        buffer += model.attributes.imgsrc;
        if(token_index !== tokens.length - 1) {
          buffer += has_clipboard_api
            ? "\n"
            : " "
          ;
        }
      }
    }

    const no_clipboard_fallback = () => {
      prompt("URLs:", buffer);
    };

    // @ts-ignore
    if(has_clipboard_api) {
      navigator["clipboard"].writeText(buffer)
        .catch(e => {
          no_clipboard_fallback();
        });

      alert("URLs copied to clipboard!");
    }
    else {
      no_clipboard_fallback();
    }
  };

  public setup() {
    TokenContextMenu.addButton(TOKEN_FROM_IMG_BUTTON_NAME, this.ui_on_add_token_button_click, TOKEN_CONTEXT_MENU_ORDER_CREATE_TOKEN_BY_URL, {cannotHaveSelection: true});
    TokenContextMenu.addButton(TOKEN_GET_URL, this.ui_on_get_token_img_url_button_click, TOKEN_CONTEXT_MENU_ORDER_GET_TOKEN_IMAGE_URL, {mustHaveSelection: true});
  }

  public dispose() {
    TokenContextMenu.removeButton(TOKEN_FROM_IMG_BUTTON_NAME, this.ui_on_add_token_button_click);
    TokenContextMenu.removeButton(TOKEN_GET_URL, this.ui_on_get_token_img_url_button_click);
    super.dispose();
  }
}

export default () => {
  new TokenFromImgModule().install();
};

