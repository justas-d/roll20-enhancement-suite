import { R20Module } from '../tools/r20Module'
import { CharacterIO } from '../tools/character-io.js'
import { R20 } from '../tools/r20api.js'
import { createElement, createSidebarSeparator } from '../tools/createElement.js'
import * as FileUtil from '../tools/fileUtil.js'
import { saveAs } from 'save-as'
import { findByIdAndRemove } from '../tools/miscUtil';

class CharacterIOModule extends R20Module.OnAppLoadBase {
    constructor(id) {
        super(id);

        this.journalWidgetId = "window.r20es-character-io-journal-widget";
        this.observerCallback = this.observerCallback.bind(this);
    }

    processFileReading(fileHandle, customCode) {
        return FileUtil.readFile(fileHandle, (e) => {
            let data = FileUtil.safeParseJson(e.target.result);
            if (!data) return;

            let version = CharacterIO.formatVersions[data.schema_version];
            if (!version) {
                alert(`Unknown schema version: ${data.schema_version}`);
                return;
            }

            let validity = version.isValidData(data);

            if (!validity.isValid) {
                alert(`Character data does not adhere to the schema version (${data.schema_version}). Reason: ${validity.reason}`);
                return;
            }

            customCode(version, data);
        });
    };

    addJournalWidget() {

        if (!window.is_gm) return;

        let journal = document.getElementById("journal").getElementsByClassName("content")[0];

        createElement("div", { id: this.journalWidgetId }, [

            () => { return createSidebarSeparator(); },

            createElement("h3", {
                innerHTML: "Import Character",
                style: {
                    marginBottom: "5px",
                    marginLeft: "5px",
                }
            }),

            createElement("input", {
                type: "file",

                onChange: e => {
                    const btn = $(e.target.parentNode).find("button")[0];
                    btn.disabled = !(e.target.files.length > 0);
                }
            }),

            createElement("button", {
                innerHTML: "Import Character",
                disabled: true,
                className: "btn",
                style: {
                    float: "Left",
                },
                onClick: e => {
                    const input = $(e.target.parentNode).find("input")[0];

                    this.processFileReading(input.files[0], (version, data) => {
                        let pc = R20.createCharacter();
                        version.overwrite(pc, data);
                    });

                    input.value = "";
                    e.target.disabled = true;
                }
            }),

            () => { return createSidebarSeparator(); },
        ], journal);
    };

    observerCallback(muts) {
        for (var e of muts) {
            //console.log(e);
            if (e.target.className && e.target.className === "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix") {

                // TODO : buttons aren't properly injected into sheets dragged from the compendium that session
                // TODO : use jquery for this
                let pcElem = e.target.parentElement.getElementsByClassName("characterdialog")[0];
                if (!pcElem) return false;

                let pc = R20.getCharacter(pcElem.attributes["data-characterid"].value);

                const exportButtonClass = "window.r20es-export";

                if (e.target.getElementsByClassName(exportButtonClass).length > 0) {
                    return false;
                }

                createElement("span", null, [
                    createElement("button", {
                        innerHTML: "Export",
                        className: ["btn", exportButtonClass],
                        style: {
                            marginRight: "8px"
                        },
                        onClick: () => {
                            CharacterIO.exportSheet(pc, data => {

                                let jsonData = JSON.stringify(data, null, 4);

                                var jsonBlob = new Blob([jsonData], { type: 'data:application/javascript;charset=utf-8' });
                                saveAs(jsonBlob, data.name + ".json");

                            })
                        }

                    }),

                    createElement("button", {
                        innerHTML: "Overwrite",
                        className: "btn",
                        disabled: true,
                        style: {
                            marginRight: "8px"
                        },

                        onClick: e => {
                            const input = $(e.target.parentNode).find("input")[0];
                            const overwriteButton = $(e.target.parentNode).find(":contains('Overwrite')")[0];

                            this.processFileReading(input.files[0], (version, data) => {
                                if (window.confirm(`Are you sure you want to overwrite ${pc.get("name")}`))
                                    version.overwrite(pc, data);
                            });

                            input.value = "";
                            overwriteButton.disabled = true;
                        }
                    }),
                    createElement("input", {
                        type: "file",
                        style: {
                            display: "inline"
                        },
                        onChange: (e) => {
                            const overwriteButton = $(e.target.parentNode).find(":contains('Overwrite')")[0];
                            overwriteButton.disabled = !(e.target.files.length > 0);
                        }
                    })
                ], e.target);
            }
        }
    }

    setup() {
        this.observer = new MutationObserver(this.observerCallback);
        this.observer.observe(document.body, { childList: true, subtree: true });
        this.addJournalWidget();
    }

    dispose() {
        findByIdAndRemove(this.journalWidgetId);

        if (this.observer) {
            this.observer.disconnect();
        }

        console.log("Disposed!!");
    }
}

if (R20Module.canInstall()) new CharacterIOModule(__filename).install();

const hook = R20Module.makeHook(__filename,{
    id: "characterImportExport",
    name: "Character Exporter/Importer",
    description: "Provides character importing (in the journal) and exporting (in the journal and on sheets).",
    category: R20Module.category.exportImport,
});

export { hook as CharacterIOHook };