import { findByIdAndRemove } from "./MiscUtils";
import {Optional} from "./TypescriptUtils";

const TOKEN_CONTEXT_MENU_GLOBAL_KEY = "tokenContextMenu";

export interface ITokenContextMenuButtonOptions {
    // only add the menu item when there is one or more object selected
    mustHaveSelection?: boolean
    // NOTE(justas): only show when there are no selected tokens
    cannotHaveSelection?: boolean
}

export interface ITokenContextMenuButton {
    id: string;
    text: string;
    callback: Function;
    options?: ITokenContextMenuButtonOptions;
}

interface InternalData {
    widgets: {[id:string] : ITokenContextMenuButton};
    idTop: number;
}

export class TokenContextMenu {

    static getInternalData = (): InternalData => {
        if (!("tokenContextMenu" in window.r20es)) {

            const newData: InternalData = {
                widgets: {},
                idTop: 0,
            };

            window.r20es[TOKEN_CONTEXT_MENU_GLOBAL_KEY] = newData;
        }

        return window.r20es[TOKEN_CONTEXT_MENU_GLOBAL_KEY];
    };

    static addButton = (text: string, callback: Function, order: number, _options: Optional<ITokenContextMenuButtonOptions> = undefined) => {

        const data = TokenContextMenu.getInternalData();
        const id = `r20es-token-ctx-menu-button-${data.idTop++}`;

        const payload: ITokenContextMenuButton = {
            id,
            text,
            callback,
            options: _options
        };

        data.widgets[order] = payload;
    };

    static removeButton = (text: string, callback: Function) => {
        const all = TokenContextMenu.getInternalData().widgets;

        for(const key in all) {
            const cur = all[key];

            if (cur.text === text && cur.callback === callback) {
                findByIdAndRemove(cur.id);
                delete all[key];
                return true;
            }
        }

        return false;
    }
}

