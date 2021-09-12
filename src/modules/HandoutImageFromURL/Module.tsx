import {R20Module} from '../../utils/R20Module'
import { DOM } from '../../utils/DOM'
import { R20 } from "../../utils/R20";

const BUTTON_CLASS = "vttes-handout-image-from-url";

class CharacterAvatarFromURL extends R20Module.OnAppLoadBase {

  observer: MutationObserver;

  constructor() {
    super(__dirname);
  }

  set_image_from_url = (e: any) => {
    e.stopPropagation();

    const el = e.target as HTMLElement;
    const id = el.getAttribute("data-handoutid");

    const handout = R20.getHandout(id);
    if(!handout) {
      alert(`Could not find handout! (Id is: ${id})`);
      return;
    }

    const url = window.prompt("Set character avatar from URL:", handout.attributes.avatar);
    if(url == null) return;

    if(url) {
      handout.save({avatar: url});
    }
    else {
      alert("Invalid URL.");
    }
  }

  try_inject = (el: HTMLElement) => {
    //console.log(el);

    const existing = el.querySelector(`.${BUTTON_CLASS}`);
    if(existing) {
      return;
    }

    const handout_id = el.getAttribute("data-handoutid");
    const avatar_el = el.querySelector(".avatar");
    const parent = avatar_el.parentElement.parentElement;

    if(parent) {

      const button = (
        <button
          className={`btn ${BUTTON_CLASS}`}
          onClick={this.set_image_from_url}
          data-handoutid={handout_id}
        >
          VTTES: Set image from URL
        </button>
      );

      parent.appendChild(button);
    }
    else {
      console.error("Could not find parent of avatar_el");
    }
  }

  observer_callback = (muts: Array<MutationRecord>) => {
    //console.log(muts);
    
    for(const mut of muts) {

      for(const el of mut.addedNodes as any as Array<HTMLElement>) {

        if(!el.firstElementChild) continue;

        if(el.classList && el.classList.contains("handouteditor")) {
          this.try_inject(el.parentElement as HTMLElement);
        }
        else if(el.firstElementChild && el.firstElementChild.classList && el.firstElementChild.classList.contains("handouteditor")) {
          this.try_inject(el as HTMLElement);
        }
      }
    }
  }

  public setup() {
    this.observer = new MutationObserver(this.observer_callback);
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  public dispose() {
    super.dispose();

    if(this.observer) {
      this.observer.disconnect();
    }

    document.querySelectorAll(`.${BUTTON_CLASS}`).forEach(e => e.remove());
  }
}

export default () => {
  new CharacterAvatarFromURL().install();
};

