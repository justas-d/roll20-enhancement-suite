import {R20Module} from "../../utils/R20Module"
import {createCSSElement, findByIdAndRemove} from "../../utils/MiscUtils";

class HidePlayerListModule extends R20Module.SimpleBase {
    private static readonly styleId = "r20es-hide-player-list-style";

    public constructor() {
        super(__dirname);
    }

    public setup() {
        const style = createCSSElement(`
#playerzone .player {
    display: none !important;
    visibility: hidden !important;
}
`, HidePlayerListModule.styleId);
        document.body.appendChild(style);
    }

    public dispose() {
        findByIdAndRemove(HidePlayerListModule.styleId);
    }
}

export default () => {
  new HidePlayerListModule().install();
};

