import { R20Module } from '../tools/r20Module'
import { CharacterIO } from '../tools/character-io.js'
import { R20 } from '../tools/r20api.js'
import { createElementJsx, SidebarSeparator, SidebarCategoryTitle } from '../tools/createElement.js'
import * as FileUtil from '../tools/fileUtil.js'
import { saveAs } from 'save-as'
import { findByIdAndRemove } from '../tools/miscUtil';

class CharacterIOModule extends R20Module.OnAppLoadBase {
    constructor(id) {
        super(id);

        this.journalWidgetId = "r20es-character-io-journal-widget";

        this.observerCallback = this.observerCallback.bind(this);
        this.onOverwriteClick = this.onOverwriteClick.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
        this.renderWidget = this.renderWidget.bind(this);
        this.onImportClick = this.onImportClick.bind(this);
        this.onJournalFileChange = this.onJournalFileChange.bind(this);
        this.navOnClick = this.navOnClick.bind(this);
        this.onClickNormalNavs = this.onClickNormalNavs.bind(this);

        this.tabStyle = "r20es-char-io-data-tab";
        this.navStyle = "r20es-char-io-export-overwrite-nav";

        // bookkeeping for disposal
        this.infectedNavs = [];
        this.injectedElements = [];
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

    onJournalFileChange(e) {
        const btn = $(e.target.parentNode).find("button")[0];
        console.log(btn);
        btn.disabled = !(e.target.files.length > 0);
    }

    onImportClick(e) {
        const input = $(e.target.parentNode).find("input")[0];

        this.processFileReading(input.files[0], (version, data) => {
            let pc = R20.createCharacter();
            version.overwrite(pc, data);
        });

        input.value = "";
        e.target.disabled = true;
    }

    addJournalWidget() {

        if (!window.is_gm) return;

        let journal = document.getElementById("journal").getElementsByClassName("content")[0];


        const widget = <div id={this.journalWidgetId}>
            <SidebarSeparator />

            <div>
                <SidebarCategoryTitle>
                    Import Character
            </SidebarCategoryTitle>

                <input
                    type="file"
                    onChange={this.onJournalFileChange}
                />

                <button disabled className="btn" style={{ display: "block", float: "left", marginBottom: "10px" }} onClick={this.onImportClick}>
                    Import Character
                </button>

            </div>

            <SidebarSeparator />
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

        this.processFileReading(input.files[0], (version, data) => {
            if (window.confirm(`Are you sure you want to overwrite ${pc.get("name")}`)) {
                version.overwrite(pc, data);
            }
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
                    <button onClick={this.onOverwriteClick} disabled style={style} className="btn">
                        Overwrite
                    </button>

                    <input type="file" style={{ display: "inline" }} onChange={this.onFileChange} />
                </div>
            </div>
        );
    }

    getWidgetTabRoot(navAElement) {
        return $(navAElement.parentNode.parentNode.parentNode).find("." + this.tabStyle)[0];
    }

    navOnClick(e) {
        e.target.parentNode.classList.add("active");

        const root = this.getWidgetTabRoot(e.target);
        root.style.display = "block";
    }

    onClickNormalNavs(e) {
        const navTabsRoot = e.target.parentNode.parentNode;

        $(navTabsRoot).find("a[data-r20es-nav]").each((i, el) => {
            el.parentNode.classList.remove("active");
        });

        const root = this.getWidgetTabRoot(e.target);
        root.style.display = "none";
    }

    tryInjectingWidget(target) {
        if(!target) return false;
        if (!target.className) return false;
        if (!target.hasAttribute("data-characterid")) return false;

        if (target.getElementsByClassName(this.tabStyle).length > 0) return;

        const pc = this.getPc(target);
        if (!pc) return false;

        const nav = (
            <li className={this.navStyle}>
                <a data-r20es-nav onClick={this.navOnClick} data-tab={this.tabStyle} href="javascript:void(0);">
                    Export/Overwrite
                </a>
            </li>
        );
        this.injectedElements.push(nav);
        console.log(target);
        target.firstElementChild.firstElementChild.appendChild(nav);


        // register an event handler on the normal navbar tabs
        // onClickNormalNavs will hide the custom stuff, state active state for the custom nav
        const navTabsRoot = target.firstElementChild.firstElementChild;
        $(navTabsRoot).find("a[data-tab]").each((i, el) => {
            if (el.hasAttribute("data-r20es-nav")) return;

            el.addEventListener("click", this.onClickNormalNavs);
            this.infectedNavs.push(el);
        });


        const tabroot = $(target.firstElementChild).find(".tab-content")[0];
        const widget = (
            <div className={[this.tabStyle, "tab-pane"]} style={{ display: "none" }}>
                {this.renderWidget()}
            </div>
        );
        this.injectedElements.push(widget);
        tabroot.appendChild(widget)

        return true;
    }

    observerCallback(muts) {
        for (var e of muts) {
            for (const added of e.addedNodes) {
                if (this.tryInjectingWidget(added)) {
                    return;
                }
            }


            if (this.tryInjectingWidget(e.target)) {
                return;
            }
        }
    }

    setup() {
        const existingHeaders = document.querySelectorAll("div[data-characterid].dialog.characterdialog");
        

        for (const header of existingHeaders) {
            this.tryInjectingWidget(header);
        }

        this.observer = new MutationObserver(this.observerCallback);
        this.observer.observe(document.body, { childList: true, subtree: true });
        this.addJournalWidget();
    }

    dispose() {

        findByIdAndRemove(this.journalWidgetId);

        this.infectedNavs.each(el => el.removeEventListener("click", this.onClickNormalNavs));
        this.injectedElements.each(el => el.remove());
        this.injectedElements.each(el => el.remove());

        this.injectedElements.length = 0;
        this.infectedNavs.length = 0;

        if (this.observer) this.observer.disconnect();
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