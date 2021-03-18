import { R20Module } from '../../utils/R20Module'
import { CharacterIO, IOverwriteStrategy } from '../../utils/CharacterIO'
import { R20 } from '../../utils/R20'
import { DOM, SidebarSeparator, SidebarCategoryTitle } from '../../utils/DOM'
import { saveAs } from 'save-as'
import { findByIdAndRemove, readFile, safeParseJson } from '../../utils/MiscUtils';
import {SheetTab, SheetTabSheetInstanceData} from '../../utils/SheetTab';
import { LoadingDialog } from '../../utils/DialogComponents';
import { import_multiple_files } from "../../utils/import_multiple_files";

interface IProcessResultData {
  strategy: IOverwriteStrategy,
  data: any;
}

class CharacterIOModule extends R20Module.OnAppLoadBase {
  static readonly journalWidgetId = "r20es-character-io-journal-widget";
  static readonly overwriteButtonClass = "r20es-sheet-overwrite-button";

  sheetTab: any = null;

  constructor() {
    super(__dirname);
  }

  static process_data(input: string): Promise<IProcessResultData> {
    return new Promise((resolve, reject) => {
      let data = null;

      try {
        data = JSON.parse(input);
      } 
      catch (err) {
        reject("File is not a valid JSON file.");
        return;
      }

      if(!data) {
        reject("Data is null.");
        return;
      }

      let version = CharacterIO.formatVersions[data.schema_version];
      if(!version) {
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

  on_journal_file_change = (e: any) => {
    const btn = $(e.target.parentNode).find("button")[0];
    console.log(btn);
    btn.disabled = !(e.target.files.length > 0);
  }

  on_import_click = (e: any) => {
    e.stopPropagation();

    const file_selector_element = (
      <input 
        type="file"
        accept=".json"
        multiple={true}
      />
    );

    import_multiple_files(file_selector_element, async (handle: File) => {
      const str = await readFile(handle) as string;
      const payload = await CharacterIOModule.process_data(str);

      const pc = R20.createCharacter();

      try {
        await payload.strategy.overwrite(pc, payload.data);
      }
      catch(e) {
        pc.destroy();
        throw e;
      }
    });
  }

  add_journal_widget = () => {
    if(!window.is_gm) return;

    let journal = document.getElementById("journal").getElementsByClassName("content")[0];

    const widget = <div id={CharacterIOModule.journalWidgetId}>
      <SidebarSeparator />

      <div>
        <SidebarCategoryTitle>
          VTTES Character Importer
        </SidebarCategoryTitle>

        <button 
          className="btn" 
          style={{ display: "block", float: "left", width: "90%", marginBottom: "10px" }} 
          onClick={this.on_import_click}
        >
          Import Character(s)
        </button>

      </div>

      <SidebarSeparator big="1px" />
    </div>

    journal.appendChild(widget);
  };

  getPc = (target: HTMLElement) => {
    if(!target) return null;
    if(!target.hasAttribute("data-characterid")) return null;

    const pcId = target.getAttribute("data-characterid");
    if (!pcId) return null;

    let pc = R20.getCharacter(pcId);
    if (!pc) return null;
    return pc;
  }

  private on_export_click = (e: any) => {
    e.stopPropagation();
    const pc = this.getPc(e.target);
    if (!pc) return;

    CharacterIO.exportSheet(pc, data => {
      let jsonData = JSON.stringify(data, null, 4);

      var jsonBlob = new Blob([jsonData], { type: 'data:application/javascript;charset=utf-8' });
      saveAs(jsonBlob, data.name + ".json");
    });
  }

  private on_overwrite_click = (e: any) => {
    e.stopPropagation();

    const file_selector_element = (
      <input 
        type="file"
        accept=".json"
      />
    );
    
    const listener = async () => {
      file_selector_element.removeEventListener("change", listener);
      const f_handle = file_selector_element.files[0];

      const pc = this.getPc(e.target);
      if (!pc) {
        alert("Could not find character that corresponds to sheet. Tell a programmer.");
        return;
      }

      if (!window.confirm(`Are you sure you want to overwrite ${pc.get("name")}`)) {
        return;
      }

      let plsWait = new LoadingDialog("Overwriting");
      plsWait.show();

      try {
        const read_result = (await readFile(f_handle)) as string;
        const payload = await CharacterIOModule.process_data(read_result);

        await payload.strategy.overwrite(pc, payload.data);
      }
      catch(e) {
        alert(e);
        console.log(e);
      }

      plsWait.dispose();

      R20.rerender_character_sheet(pc);
    };

    file_selector_element.click();
    file_selector_element.addEventListener("change", listener);
  }

  renderWidget = (data: SheetTabSheetInstanceData<any>) => {
    const style = { marginRight: "8px" };
    const headerStyle = { marginBottom: "10px", marginTop: "10px" };

    const char = R20.getCharacter(data.characterId);
    if (!char) {
      return <p>Couldn't find the character associated with this dialog box! Tell a programmer.</p>
    }

    const canEdit = R20.canEditCharacter(char);

    return (
      <div style={{
        display:"grid", 
        gridTemplateColumns:"1fr 1fr", 
        gridTemplateRows:"1fr 1fr", 
        columnGap: "16px"
      }}>
        <div style={{width:"100%",display:"inline-block"}}>
          <h3>Export</h3>

          <p>
            Export this character as a VTTES character JSON file.
          </p>

        </div>

        <div style={{width:"100%",display:"inline-block"}}>
          <h3>Overwrite</h3>

          <p>
            Overwrite this character with the character stored in the selected VTTES character JSON file.
          </p>
        </div>

        <input 
          type="button" 
          onClick={this.on_export_click} 
          className="btn" 
          style={{width:"auto"}}
          data-characterid={data.characterId}
          value="Export"
        />

        <input 
          type="button" 
          onClick={this.on_overwrite_click} 
          className="btn" 
          style={{width:"auto"}}
          data-characterid={data.characterId}
          value={canEdit ? "Overwrite" : "You do not have permission to edit this character"}
          disabled={!canEdit}
        />
      </div>
    )
  };

  setup = () => {
    this.sheetTab = SheetTab.add("Export & Overwrite", this.renderWidget);
    this.add_journal_widget();
  }

  dispose = () => {
    super.dispose();

    if (this.sheetTab) this.sheetTab.dispose();
    findByIdAndRemove(CharacterIOModule.journalWidgetId);
  }
}

if (R20Module.canInstall()) new CharacterIOModule().install();
