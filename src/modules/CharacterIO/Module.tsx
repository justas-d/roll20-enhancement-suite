import { R20Module } from '../../utils/R20Module'
import { CharacterIO, IOverwriteStrategy } from '../../utils/CharacterIO'
import { R20 } from '../../utils/R20'
import { DOM, SidebarSeparator, SidebarCategoryTitle } from '../../utils/DOM'
import { saveAs } from 'save-as'
import { findByIdAndRemove, readFile, safeParseJson } from '../../utils/MiscUtils';
import {SheetTab, SheetTabSheetInstanceData} from '../../utils/SheetTab';
import { LoadingDialog } from '../../utils/DialogComponents';

interface IProcessResultData {
    strategy: IOverwriteStrategy,
    data: any;
}

class CharacterIOModule extends R20Module.OnAppLoadBase {
    private static readonly journalWidgetId = "r20es-character-io-journal-widget";
    private static readonly overwriteButtonClass = "r20es-sheet-overwrite-button";

    private sheetTab: any = null;

    constructor() {
        super(__dirname);
    }

    private catchError = (e: any) => {
        alert(e);
        console.trace();
        console.error(e);
    };

    private static processData(input: string): Promise<IProcessResultData> {
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

            const payload: IProcessResultData = {
                strategy: version,
                data
            }

            resolve(payload);
        });
    }

    private onJournalFileChange = (e: any) => {
        const btn = $(e.target.parentNode).find("button")[0];
        console.log(btn);
        btn.disabled = !(e.target.files.length > 0);
    }

    private onImportClick = (e: any) => {
        const input = $(e.target.parentNode).find("input")[0];

        let plsWait = new LoadingDialog("Importing");
        plsWait.show();

        const handle = input.files[0];
        
        const promise = readFile(handle)
            .then(CharacterIOModule.processData)
            .then(payload => {
                let pc = R20.createCharacter();
                console.log(pc);
                console.log(payload);
                const result = payload.strategy.overwrite(pc, payload.data);
                if(result.isErr()) {
                    this.catchError(result.err().unwrap());
                    pc.destroy();
                }
            })
            .catch(this.catchError);

        (promise as any).finally(plsWait.dispose);

        input.value = "";
        e.target.disabled = true;
    }

    private addJournalWidget = () => {

        if (!window.is_gm) return;

        let journal = document.getElementById("journal").getElementsByClassName("content")[0];


        const widget = <div id={CharacterIOModule.journalWidgetId}>
            <SidebarSeparator />

            <div>
                <SidebarCategoryTitle>
                    Import Character
                </SidebarCategoryTitle>

                <input
                    type="file"
                    style={{ width: "95%" }}
                    onChange={this.onJournalFileChange}
                />

                <button disabled className="btn" style={{ display: "block", float: "left", width: "90%", marginBottom: "10px" }} onClick={this.onImportClick}>
                    Import Character
                </button>

            </div>

            <SidebarSeparator big="1px" />
        </div>

        journal.appendChild(widget);
    };

    private getPc = (target: HTMLElement) => {
        if(!target) return null;

        let elem = null;
        if (target.hasAttribute("data-characterid")) {
            elem = target;
        } else {
            let query = $(target).closest("div[data-characterid]");
            if (!query) return null;
            elem = query[0];
        }

        if(!elem) return null;

        const pcId = elem.getAttribute("data-characterid");
        if (!pcId) return null;

        let pc = R20.getCharacter(pcId);
        if (!pc) return null;
        return pc;
    }

    private onExportClick = (e: any) => {
        e.stopPropagation();
        const pc = this.getPc(e.target.parentElement.parentElement);
        if (!pc) return;

        CharacterIO.exportSheet(pc, data => {

            let jsonData = JSON.stringify(data, null, 4);

            var jsonBlob = new Blob([jsonData], { type: 'data:application/javascript;charset=utf-8' });
            saveAs(jsonBlob, data.name + ".json");

        })
    }

    private onOverwriteClick = (e: any) => {
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

        const promise = readFile(fileHandle)
            .then(CharacterIOModule.processData)
            .then(payload => payload.strategy.overwrite(pc, payload.data))
            .catch(this.catchError);

        (promise as any).finally(plsWait.dispose);
    }

    private onFileChange = (e: any) => {
        e.stopPropagation();

        const overwriteButton = $(e.target.parentNode).find("." + CharacterIOModule.overwriteButtonClass)[0];
        overwriteButton.disabled = !(e.target.files.length > 0);
    }

    private renderWidget = (data: SheetTabSheetInstanceData<any>) => {
        const style = { marginRight: "8px" };
        const headerStyle = { marginBottom: "10px", marginTop: "10px" };

        const char = R20.getCharacter(data.characterId);
        if (!char) {
            return <p>Couldn't find the character associated with this dialog box! Tell a programmer.</p>
        }

        const canEdit = R20.canEditCharacter(char);

        return (
            <div>
                <h3 style={headerStyle}>Export</h3>
                <div className="r20es-indent">
                    <button onClick={this.onExportClick} style={style} className="btn">
                        Export
                </button>
                </div>


                {canEdit &&
                <div>
                    <h3 style={headerStyle}>Overwrite</h3>
                    <div className="r20es-indent">
                        <button onClick={this.onOverwriteClick} disabled style={style}
                                className={["btn", CharacterIOModule.overwriteButtonClass]}>
                            Overwrite this Character with:
                        </button>

                        <input type="file" style={{display: "inline"}} onChange={this.onFileChange}/>
                    </div>
                </div>
                }
            </div>
        );
    };

    public setup = () => {
        this.sheetTab = SheetTab.add("Export & Overwrite", this.renderWidget);
        this.addJournalWidget();
    }

    public dispose = () => {
        super.dispose();

        if (this.sheetTab) this.sheetTab.dispose();
        findByIdAndRemove(CharacterIOModule.journalWidgetId);
    }
}

if (R20Module.canInstall()) new CharacterIOModule().install();
