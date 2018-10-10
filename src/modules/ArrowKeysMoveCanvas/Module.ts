import {R20Module} from "../../utils/R20Module";
import {R20} from "../../utils/R20";

class ArrowKeysMoveCanvasModule extends R20Module.OnAppLoadBase {
    private wasBound: boolean = false;

    public constructor() {
        super(__dirname);
    }

    private MOVE_STEP = 50;

    private move(dx: number, dy: number) {
        if(R20.getSelectedTokens().length > 0) return;

        const editor = $("#editor-wrapper")[0];

        editor.scrollTop += dy;
        editor.scrollLeft += dx;
    }

    private left = () => {
        this.move(-this.MOVE_STEP, 0);
    };

    private right = () => {
        this.move(this.MOVE_STEP, 0);
    };

    private up = () => {
        this.move(0, -this.MOVE_STEP);
    };

    private down = () => {
        this.move(0, this.MOVE_STEP);
    };

    public setup() {
        window.Mousetrap.bind("right", this.right);
        window.Mousetrap.bind("left", this.left);
        window.Mousetrap.bind("up", this.up);
        window.Mousetrap.bind("down", this.down);
        this.wasBound = true;
    }

    public dispose() {
        super.dispose();

        if (this.wasBound) {
            this.wasBound = false;

            window.Mousetrap.unbind("right");
            window.Mousetrap.unbind("left");
            window.Mousetrap.unbind("up");
            window.Mousetrap.unbind("down");
        }
    }
}

if (R20Module.canInstall()) new ArrowKeysMoveCanvasModule().install();
