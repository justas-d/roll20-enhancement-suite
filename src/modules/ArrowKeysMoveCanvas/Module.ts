import {R20Module} from "../../utils/R20Module";
import {R20} from "../../utils/R20";

const RIGHT = "right";
const LEFT = "left";
const UP = "up";
const DOWN = "down";

class ArrowKeysMoveCanvasModule extends R20Module.OnAppLoadBase {
  was_bound: boolean = false;

  old_right?: Function;
  old_left?: Function;
  old_up?: Function;
  old_down?: Function;

  public constructor() {
    super(__dirname);
  }

  public setup() {
    const move = (dx: number, dy: number) => {
      if(R20.getSelectedTokens().length > 0) return;

      const editor = $("#editor-wrapper")[0];

      editor.scrollTop += dy;
      editor.scrollLeft += dx;
    }

    const MOVE_STEP = 50;
    
    const mousetrap_data = window.Mousetrap.bind("", null);
    this.old_right = mousetrap_data._directMap[`${RIGHT}:undefined`];
    this.old_left = mousetrap_data._directMap[`${LEFT}:undefined`];
    this.old_up = mousetrap_data._directMap[`${UP}:undefined`];
    this.old_down = mousetrap_data._directMap[`${DOWN}:undefined`];

    window.Mousetrap.bind(RIGHT, (a,b) => {
      move(MOVE_STEP, 0);
      if(this.old_right != null) this.old_right(a, b);
    });

    window.Mousetrap.bind(LEFT, (a,b) => {
      move(-MOVE_STEP, 0);
      if(this.old_left != null) this.old_left(a, b);
    });

    window.Mousetrap.bind(UP, (a,b) => {
      move(0, -MOVE_STEP);
      if(this.old_up != null) this.old_up(a, b);
    });

    window.Mousetrap.bind(DOWN, (a,b) => {
      move(0, MOVE_STEP);
      if(this.old_down != null) this.old_down(a, b);
    });

    this.was_bound = true;
  }

  public dispose() {
    super.dispose();

    if(this.was_bound) {
      this.was_bound = false;

      window.Mousetrap.unbind(RIGHT);
      window.Mousetrap.unbind(LEFT);
      window.Mousetrap.unbind(UP);
      window.Mousetrap.unbind(DOWN);

      if(this.old_right != null) window.Mousetrap.bind(RIGHT, this.old_right);
      if(this.old_left != null) window.Mousetrap.bind(LEFT, this.old_left);
      if(this.old_up != null) window.Mousetrap.bind(UP, this.old_up);
      if(this.old_down != null) window.Mousetrap.bind(DOWN, this.old_down);

      this.old_right = null;
      this.old_left = null
      this.old_up = null;
      this.old_down = null;
    }
  }
}

export default () => {
  new ArrowKeysMoveCanvasModule().install();
};

