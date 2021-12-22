import { R20Module } from "../../utils/R20Module"
import { DOM } from "../../utils/DOM"
import { R20 } from "../../utils/R20";
import { findByIdAndRemove } from "../../utils/MiscUtils";

class DuplicateButtonModule extends R20Module.SimpleBase {
  static readonly optionId = "window.r20es-duplicate-journal";

  constructor() {
    super(__dirname);
  }

  static doDuplicate(id: string) {
    const note = R20.getHandout(id);
    const char = R20.getCharacter(id);

    if(char) {
      const blobsPromise = Promise.all([
        R20.getBlob(char, "notes"),
        R20.getBlob(char, "gmnotes"),
        R20.getBlob(char, "defaulttoken")
      ]);

      if(!char.editview.el.firstElementChild) {
        char.editview.render();
      }

      blobsPromise.then(() => {
        $(char.editview.el).find(".duplicate").trigger("click");
      });
    } 
    else if(note) {
      if (!note.editview.el.firstElementChild) {
        note.editview.render();
      }

      let json = note.toJSON();
      delete json.id;

      var blobs: Roll20.HandoutBlobs = {};
      let newNote = note.collection.create(json);

      Promise.all([
        R20.getBlob(note, "notes").then(b => blobs.notes = b),
        R20.getBlob(note, "gmnotes").then(b => blobs.gmnotes = b),
      ]).then(() => {
        newNote.updateBlobs(blobs);
      });
    }
  }

  setup() {
    if(!R20.isGM()) {
      return;
    }

    let menu = document.getElementById("journalitemmenu");
    if(menu) {
      menu.firstElementChild.appendChild(
        <li data-action-type="r20esduplicate" id={DuplicateButtonModule.optionId}>
            Duplicate
        </li>
      );
    }

    window.r20es.onJournalDuplicate = DuplicateButtonModule.doDuplicate;
  }

  dispose() {
    window.r20es.onJournalDuplicate = null;
    findByIdAndRemove(DuplicateButtonModule.optionId);
  }
}


export default () => {
  new DuplicateButtonModule().install();
};

