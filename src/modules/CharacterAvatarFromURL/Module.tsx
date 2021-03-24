import {R20Module} from '../../utils/R20Module'
import { DOM } from '../../utils/DOM'
import { R20 } from "../../utils/R20";

class CharacterAvatarFromURL extends R20Module.OnAppLoadBase {

  observer: MutationObserver;
  last_url: string;

  constructor() {
    super(__dirname);
  }

  set_image_from_url = (e: any) => {
    e.stopPropagation();

    const el = e.target as HTMLElement;
    const character_id = el.getAttribute("data-characterid");

    const pc = R20.getCharacter(character_id);
    if(!pc) {
      alert(`Could not find character associated with sheet! (Id is: ${character_id})`);
      return;
    }

    const url = window.prompt("Set character avatar from URL:", this.last_url);

    if(url) {
      this.last_url = url;
      pc.save({avatar: url});
    }
    else {
      alert("Invalid URL.");
    }
  }

  observer_callback = (muts: Array<MutationRecord>) => {
    for(const mut of muts) {
      for(const el of mut.addedNodes as any as Array<HTMLElement>) {
        if(!el.firstElementChild) continue;

        if(el.firstElementChild.classList.contains("charactereditor")) {
          //console.log(el);

          const character_id = el.getAttribute("data-characterid");

          const avatar_el = el.querySelector(".avatar");
          if(avatar_el) {
            //console.log(avatar_el);
            const insert_before = avatar_el.nextElementSibling.nextElementSibling;
            if(insert_before) {
              //console.log(insert_before);
              const button = (
                <button
                  className="btn"
                  onClick={this.set_image_from_url}
                  data-characterid={character_id}
                >
                  VTTES: Set from URL
                </button>
              )

              avatar_el.parentNode.insertBefore(button, insert_before);
            }
          }
          //else {
          //  console.error("Could not find avatar_el");
          //}
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
  }
}

if (R20Module.canInstall()) new CharacterAvatarFromURL().install();
