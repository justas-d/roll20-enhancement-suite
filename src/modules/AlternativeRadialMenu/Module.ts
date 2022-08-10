import { R20Module } from "../../utils/R20Module"
import { createCSSElement, findByIdAndRemove } from "../../utils/MiscUtils";
import {R20} from "../../utils/R20";

class AlternativeRadialMenuModule extends R20Module.OnAppLoadBase {
  readonly sheetId: string = "r20es-alternative-radial-menu-sheet";

  constructor() {
    super(__dirname);
  }

  addStyle() {
    const cfg = this.getHook().config;
    console.log(cfg);
    let style = `

#radial-menu .button {
  position: static;
  height: auto;
  width: 60px;
  border-radius: 0px;
  border: none;
}

#radial-menu .button.open {
  opacity: ${cfg.opacity};
}

#radial-menu .button-1, 
#radial-menu .button-2,
#radial-menu .button-6 {
  transform: translateX(-65px) translateY(-14px);
  z-index: 5;
}

#radial-menu .button-6 {
  transform: translateX(-65px) translateY(-105px);
}

#radial-menu .button-3, 
#radial-menu .button-4,
#radial-menu .button-5 {
  transform: translateX(75px) translateY(-75px);
}

#radial-menu .button div.inner {
  margin: 0px;
  border-radius: 0px;
}

#radial-menu .markermenu.open {
  border-radius: 0;
  top: 62px;
  padding-left: 0;
  left: -80px;
  width: 375px;
  height: auto;
}

`;

    if(cfg.superMinimal) {
      style += `

#radial-menu .markermenu.open {
  left: -55px;
  width: 260px;
}

#radial-menu .button div.inner {
  background: rgba(0,0,0,0);
}

#radial-menu .button {
  width: 30px;
}

#radial-menu .button-1, 
#radial-menu .button-2 {
  transform: translateX(-35px) translateY(-14px);
}

#radial-menu .button-6 {
  transform: translateX(-35px) translateY(-105px);
}

#radial-menu .button div.inner.hasnumber span {
  text-shadow: 0px 0px 3px rgba(0,0,0,1);
  text-shadow: 1px 1px 0px rgba(0,0,0,1);
}

#radial-menu .markermenu .markercolor {
  width: 20px;
  height: 20px;
}

#radial-menu .markermenu .markercolor,
#radial-menu .markermenu .markericon {
  margin: 0;
  border: 2px solid white;
}

#radial-menu .markermenu .markercolor.active,
#radial-menu .markermenu .markericon.active {
  border: 2px solid black;
}

#radial-menu .button[data-action-type] div.inner {
  background: unset;
}

`
    }

    const el = createCSSElement(style, this.sheetId);
    document.body.appendChild(el);
  }

  removeStyle() {
    findByIdAndRemove(this.sheetId);
  }

  mutation_observer: MutationObserver;

  ui_on_mutate = (mutations: MutationRecord[]) => {
    for(const mut of mutations) {
      mut.addedNodes.forEach((n: HTMLElement)=> {
        if(n.id !== "radial-menu") {
          return;
        }

        const selected = R20.getSelectedTokens();
        if(selected.length != 1) {
          return;
        }

        const cfg = this.getHook().config;

        const tkn =selected[0];

        /*
            original

        const cos = Math.cos(tkn.angle);
        const sin = Math.sin(tkn.angle);
        const x_basis = [cos * tkn.width, sin];
        const y_basis = [cos, sin * tkn.height];

        const width = x_basis[0] * 1 + x_basis[1] * 0; // dot
        const height = y_basis[0] * 0 + y_basis[1] * 1; // dot
        */

        const camera_scale = R20.getCanvasZoom() / 2;
        const cos = Math.cos(tkn.angle * Math.PI / 180.0);
        let width = Math.abs(cos * tkn.width);

        width = width <= 0.00001 ? tkn.height : width;

        // NOTE(justasd): add 240 to try to not block the rotation gizmo when we have rotation
        if(Math.abs(Math.floor(tkn.angle)  % 360) >= 0.00001) {
            width += (240 * camera_scale);
        }

        console.log(width, tkn.angle, tkn.width);

        const shape_width_in_screen_px = width * camera_scale;

        const nodes = n.children  as any as HTMLElement[];

        const unit_block_size = 30;
        const pad = 5;
        for(const node of nodes) {
          // NOTE(justasd): lhs
          if(node.classList.contains("button-1") || node.classList.contains("button-2") || node.classList.contains("button-6")) {
            var x_offset_in_screen_px = -shape_width_in_screen_px - unit_block_size - pad;
            if(cfg.superMinimal) {
              x_offset_in_screen_px += unit_block_size;
            }

            // NOTE(justas): the pause/play button is janky and needs a special y coord
            if(node.classList.contains("button-6")) {
              node.style.transform = `translateX(${x_offset_in_screen_px}px) translateY(-105px)`
            }
            else {
              node.style.transform = `translateX(${x_offset_in_screen_px}px) translateY(-14px)`
            }
          }

          // NOTE(justas): rhs
          else if (node.classList.contains("button-3") || node.classList.contains("button-4") || node.classList.contains("button-5")) {
            // NOTE(justas): +10 to adjust for improper centering
            const x_offset_in_screen_px = shape_width_in_screen_px + unit_block_size + pad + 10;
            node.style.transform = `translateX(${x_offset_in_screen_px}px) translateY(-75px)`
          }
        }
      });
    }
  };

  try_install_auto_width = () => {
    const cfg = this.getHook().config;
    if(cfg.auto_width) {
      this.mutation_observer = new MutationObserver(this.ui_on_mutate);
      this.mutation_observer.observe(document.getElementById("editor-wrapper"), {childList: true, subtree: true});
    }
  };

  try_uninstall_auto_width = () => {
    this.mutation_observer.disconnect();
  };

  onSettingChange(name: string, oldVal: any, newVal: any) {
    this.removeStyle();
    this.addStyle();

    this.try_uninstall_auto_width();
    this.try_install_auto_width();
  }

  setup() {
    this.try_install_auto_width();

    this.addStyle();
  }

  dispose() {
    this.try_uninstall_auto_width();

    this.removeStyle();
  }
}

export default () => {
  new AlternativeRadialMenuModule().install();
};

