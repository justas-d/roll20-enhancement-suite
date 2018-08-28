import { R20Module } from '../tools/R20Module'
import { CharacterIO } from '../tools/CharacterIO.js'
import { R20 } from '../tools/R20'
import { DOM, SidebarSeparator, SidebarCategoryTitle } from '../tools/DOM.js'
import { saveAs } from 'save-as'
import { findByIdAndRemove, readFile, safeParseJson } from '../tools/MiscUtils';
import { SheetTab } from '../tools/SheetTab';
import { LoadingDialog } from '../tools/DialogComponents';


class CharacterIOModule extends R20Module.OnAppLoadBase {
    constructor(id) {
        super(id);

        this.journalWidgetId = "r20es-character-io-journal-widget";
        this.overwriteButtonClass = "r20es-sheet-overwrite-button";

        this.onOverwriteClick = this.onOverwriteClick.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
        this.renderWidget = this.renderWidget.bind(this);
        this.onImportClick = this.onImportClick.bind(this);
        this.onJournalFileChange = this.onJournalFileChange.bind(this);
    }

    static processData(input) {
        return new Promise((resolve, reject) => {
            let data = null;

            try {
                data = JSON.parse(input);
            } catch (err) {
                reject("File is not a valid JSON file.");
                return;
            }

            if (!data) {
                reject("Data is null.");
                return;
            }

            let version = CharacterIO.formatVersions[data.schema_version];
            if (!version) {
                reject(`Unknown schema version: ${data.schema_version}`);
                return;
            }

            let validity = version.isValidData(data);

            if (!validity.isValid) {
                reject(`Character data does not adhere to the schema version (${data.schema_version}). Reason: ${validity.reason}`);

                return;
            }

            resolve({ version, data });
        });
    }

    onJournalFileChange(e) {
        const btn = $(e.target.parentNode).find("button")[0];
        console.log(btn);
        btn.disabled = !(e.target.files.length > 0);
    }

    onImportClick(e) {
        const input = $(e.target.parentNode).find("input")[0];

        let plsWait = new LoadingDialog("Importing");
        plsWait.show();

        const handle = input.files[0];
        readFile(handle)
            .then(CharacterIOModule.processData)
            .then(payload => {
                let pc = R20.createCharacter();
                payload.version.overwrite(pc, payload.data);
            })
            .catch( alert)
            .finally(plsWait.dispose)

        input.value = "";
        e.target.disabled = true;
    }

    addJournalWidget() {

        if (!window.is_gm) return;

        let journal = document.getElementById("journal").getElementsByClassName("content")[0];


        const widget = <div id={this.journalWidgetId}>
            <SidebarSeparator/>

            <div>
                <SidebarCategoryTitle>
                    Import Character
                </SidebarCategoryTitle>

                <input
                    type="file"
                    style={{width: "95%"}}
                    onChange={this.onJournalFileChange}
                />

                <button disabled className="btn" style={{ display: "block", float: "left", width: "90%", marginBottom: "10px" }} onClick={this.onImportClick}>
                    Import Character
                </button>

            </div>

            <SidebarSeparator big="1px"/>
        </div>

        journal.appendChild(widget);
    };

    getPc(target) {
        let elem = null;
        if (target.hasAttribute("data-characterid")) {
            elem = target;
        } else {
            let query = $(target).closest("div[data-characterid]");
            if (!query) return null;
            elem = query[0];
        }

        const pcId = elem.getAttribute("data-characterid");
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

        const fileHandle = input.files[0];
        input.value = "";
        overwriteButton.disabled = true;

        if (!window.confirm(`Are you sure you want to overwrite ${pc.get("name")}`)) {
            return;
        }

        let plsWait = new LoadingDialog("Overwriting");
        plsWait.show();
        
        readFile(fileHandle)
            .then(CharacterIOModule.processData)
            .then(payload => payload.version.overwrite(pc, payload.data))
            .catch(alert)
            .finally(plsWait.dispose);
    }

    onFileChange(e) {
        e.stopPropagation();

        const overwriteButton = $(e.target.parentNode).find("." + this.overwriteButtonClass)[0];
        overwriteButton.disabled = !(e.target.files.length > 0);
    }

    renderWidget() {
        const style = { marginRight: "8px" }
        const headerStyle = { marginBottom: "10px", marginTop: "10px" }
        return (
            <div className={this.sheetWidgetClass}>
                <h3 style={headerStyle}>Export</h3>
                <div className="r20es-indent">
                    <button onClick={this.onExportClick} style={style} className="btn">
                        Export
                </button>
                </div>

                <h3 style={headerStyle}>Overwrite</h3>
                <div className="r20es-indent">
                    <button onClick={this.onOverwriteClick} disabled style={style} className={["btn", this.overwriteButtonClass]}>
                        Overwrite this Character with:
                    </button>

                    <input type="file" style={{ display: "inline" }} onChange={this.onFileChange} />
                </div>
            </div>
        );
    }


    setup() {
        this.sheetTab = SheetTab.add("Export & Overwrite", this.renderWidget);
        this.addJournalWidget();
    }

    dispose() {
        super.dispose();

        if (this.sheetTab) this.sheetTab.dispose();
        findByIdAndRemove(this.journalWidgetId);
    }
}

if (R20Module.canInstall()) new CharacterIOModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "characterImportExport",
    name: "Character Importer/Exporter",
    description: "Provides character importing (in the journal) and exporting (in the journal and on sheets).",
    category: R20Module.category.exportImport,
    media: {
        "char_import.png": "Journal widget",
        "sheet_export.png": "Sheet tab",
    }
});

export { hook as CharacterIOHook };
