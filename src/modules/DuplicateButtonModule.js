import { R20Module } from "../tools/R20Module"
import { DOM } from "../tools/DOM"
import { R20 } from "../tools/R20";
import { findByIdAndRemove } from "../tools/MiscUtils";

class DuplicateButtonModule extends R20Module.SimpleBase {

    constructor(id) {
        super(id);
        this.optionId = "window.r20es-duplicate-journal";
    }

    setup() {
        let menu = document.getElementById("journalitemmenu");
        if (menu) {
            menu.firstElementChild.appendChild(
                <li data-action-type="r20esduplicate" id={this.optionId}>
                    Duplicate
                </li>
            );
        }

        window.r20es.onJournalDuplicate = function (id) {

            const note = R20.getHandout(id);
            const char = R20.getCharacter(id);

            if (char) {
                char._getLatestBlob("notes", () => { });
                char._getLatestBlob("gmnotes", () => { });
                char._getLatestBlob("defaulttoken", () => { });

                if (!char.editview.el.firstElementChild) {
                    char.editview.render();
                }

                setTimeout(() => {
                    { $(char.editview.el).find(".duplicate").trigger("click"); }
                }, 1000);

            } else if (note) {
                var blobs = {};

                note._getLatestBlob("notes", (b) => { blobs.notes = b });
                note._getLatestBlob("gmnotes", (b) => { blobs.gmnotes = b });

                if (!note.editview.el.firstElementChild) {
                    note.editview.render();
                }

                let json = noterender;
                delete json.id;

                let newNote = note.collection.create(json);

                setTimeout(() => {
                    newNote.updateBlobs(blobs);
                }, 1000);
            }
        }
    }

    dispose() {
        window.r20es.onJournalDuplicate = null;
        findByIdAndRemove(this.optionId);
    }
}


if (R20Module.canInstall()) new DuplicateButtonModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "duplicateInJournalContextMenu",
    name: `"Duplicate" in journal context menu`,
    description: `Adds a "Duplicate" entry to the context menu of items found in the journal.`,
    category: R20Module.category.journal,
    gmOnly: true,

    includes: "assets/app.js",
    find: `$("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"`,
    patch: `$("#journalitemmenu ul").on(mousedowntype, "li[data-action-type=r20esduplicate]",() => {if(window.r20es && window.r20es.onJournalDuplicate) window.r20es.onJournalDuplicate($currentItemTarget.attr("data-itemid"))}),
$("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"`
});

export { hook as DuplicateButtonHook }
