import { R20Module } from '../tools/r20Module'
import { CharacterIO } from '../tools/character-io.js'
import { R20 } from '../tools/r20api.js'
import { createElement, createSidebarSeparator, createElementJsx } from '../tools/createElement.js'
import * as FileUtil from '../tools/fileUtil.js'
import { saveAs } from 'save-as'
import { findByIdAndRemove } from '../tools/miscUtil';

class CharacterIOModule extends R20Module.OnAppLoadBase {
    constructor(id) {
        super(id);

        this.journalWidgetId = "r20es-character-io-journal-widget";
        this.sheetWidgetClass = "r20es-character-io-sheet-widget";

        this.observerCallback = this.observerCallback.bind(this);
        this.onOverwriteClick = this.onOverwriteClick.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
        this.renderWidget = this.renderWidget.bind(this);
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

    getPc(target) {
        let pcElem = target.parentElement.getElementsByClassName("characterdialog")[0];
        if (!pcElem) return null;

        const idAttrib = "data-characterid";
        if (!pcElem.hasAttribute(idAttrib)) return null;

        const pcId = pcElem.getAttribute(idAttrib);
        if (!pcId) return null;

        let pc = R20.getCharacter(pcId);
        if (!pc) return null;
        return pc;
    }

    onExportClick(e) {
        e.stopPropagation();
        const pc = this.getPc(e.target.parentElement.parentElement);
        if (!pc) return;

        CharacterIO.exportSheet(pc, data => {

            let jsonData = JSON.stringify(data, null, 4);

            var jsonBlob = new Blob([jsonData], { type: 'data:application/javascript;charset=utf-8' });
            saveAs(jsonBlob, data.name + ".json");

        })
    }

    onOverwriteClick(e) {
        e.stopPropagation();

        const input = $(e.target.parentNode).find("input")[0];
        const overwriteButton = $(e.target.parentNode).find(":contains('Overwrite')")[0];

        const pc = this.getPc(e.target.parentElement.parentElement);
        if (!pc) return;

        this.processFileReading(input.files[0], (version, data) => {
            if (window.confirm(`Are you sure you want to overwrite ${pc.get("name")}`))
                version.overwrite(pc, data);
        });

        input.value = "";
        overwriteButton.disabled = true;
    }

    onFileChange(e) {
        e.stopPropagation();

        const overwriteButton = $(e.target.parentNode).find(":contains('Overwrite')")[0];
        overwriteButton.disabled = !(e.target.files.length > 0);
    }

    renderWidget() {
        const style = { marginRight: "8px" }
        return (
            <span className={this.sheetWidgetClass}>

                <button onClick={this.onExportClick} style={style} className="btn">
                    Export
                </button>

                <button onClick={this.onOverwriteClick} disabled style={style} className="btn">
                    Overwrite
                </button>

                <input type="file" style={{ display: "inline" }} onChange={this.onFileChange} />
            </span>
        );
    }

    tryInjectingWidget(target) {
        if (!target.className) return false;
        if (target.className !== "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix") return false;

        if(target.getElementsByClassName(this.sheetWidgetClass).length > 0) return;

        const pc = this.getPc(target);
        if (!pc) return false;

        console.log(target);

        const widget = this.renderWidget();
        target.appendChild(widget);

        return true;
    }

    observerCallback(muts) {
        for (var e of muts) {
            if (this.tryInjectingWidget(e.target)) {
                break;
            }
        }
    }

    setup() {
        const existingHeaders = document.querySelectorAll(".ui-dialog-titlebar, .ui-widget-header, .ui-corner-all,  .ui-helper-clearfix");

        for(const header of existingHeaders) {
            this.tryInjectingWidget(header);
        }

        this.observer = new MutationObserver(this.observerCallback);
        this.observer.observe(document.body, { childList: true, subtree: true });
        this.addJournalWidget();
    }

    dispose() {

        const widgets = document.getElementsByClassName(this.sheetWidgetClass);

        // removing a widget modifies the widgets html element collection 
        // therefore we have to treat this as a stack
        let num = widgets.length;
        while(num --> 0) {
            widgets[0].remove();
        }

        findByIdAndRemove(this.journalWidgetId);

        if (this.observer) {
            this.observer.disconnect();
        }

        console.log("Disposed!!");
    }
}

if (R20Module.canInstall()) new CharacterIOModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "characterImportExport",
    name: "Character Exporter/Importer",
    description: "Provides character importing (in the journal) and exporting (in the journal and on sheets).",
    category: R20Module.category.exportImport,
});

export { hook as CharacterIOHook };