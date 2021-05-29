import { R20Module } from '../../utils/R20Module'
import { R20 } from '../../utils/R20'
import { DOM, SidebarSeparator, SidebarCategoryTitle } from '../../utils/DOM'
import { saveAs } from 'save-as'
import { findByIdAndRemove, readFile, safeParseJson } from '../../utils/MiscUtils';
import { SheetTab, SheetTabSheetInstanceData } from '../../utils/SheetTab';
import { LoadingDialog } from '../../utils/DialogComponents';
import { import_multiple_files } from "../../utils/import_multiple_files";
import {replaceAll} from "../../utils/MiscUtils";
import {Handout, Character, CharacterBlobs, CharacterAttributes} from "roll20";
import { promiseWait } from "../../utils/promiseWait";

const get_default_character_save = (): any => {
  return {
    name: "",
    avatar: "",
    tags: "",
    controlledby: "",
    inplayerjournals: "",
    defaulttoken: "",
    bio: "",
    gmnotes: "",
    archived: false,
    attrorder: "",
    abilorder: "",
    mancerdata: "",
    mancerget: "",
    mancerstep: "",
  };
};

const get_default_character_blobs = () => {
  const blob: CharacterBlobs = {
    defaulttoken: null,
    bio: null
  };

  if (R20.isGM()) {
    blob.gmnotes = null;
  }

  return blob;
};

const overwrite_char_v1 = (pc: Character, data: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    //console.log("Schema 1");

    const hasNot = what => !(what in data);

    if(hasNot("name")) return reject("name not found");
    if(hasNot("avatar")) return reject("avatar not found");
    if(hasNot("bio")) return reject("bio not found");
    if(hasNot("attribs")) return reject("attribs not found");

    let idx = 0;
    for (let el of data.attribs) {
      if (!("name" in el)) return reject(`Attribute index ${idx} doesn't have name`);
      if (!("current" in el)) return reject(`Attribute index ${idx} doesn't have current`);
      if (!("max" in el)) return reject(`Attribute index ${idx} doesn't have max`);
    }

    R20.wipeObjectStorage(pc.abilities);
    R20.wipeObjectStorage(pc.attribs);

    let save = get_default_character_save();
    save.name = data.name;
    save.avatar = data.avatar;

    let blobs = get_default_character_blobs();
    blobs.bio = data.bio;
    pc.updateBlobs(blobs);

    for(let importAttrib of data.attribs) {
      pc.attribs.create(importAttrib);
    }

    pc.save(save, { success: (v) => {
      resolve();
    }});
  });
}

const overwrite_char_v2 = (pc: Character, data: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    //console.log("Schema 2");

    const hasNot = what => !(what in data);

    //if (hasNot("oldId")) return new Err("oldId not found");
    if (hasNot("name")) return reject("name not found");
    //if (hasNot("avatar")) return reject("avatar not found");
    //if (hasNot("bio")) return reject("bio not found");
    //if (hasNot("gmnotes")) return reject("gmnotes not found");
    //if (hasNot("defaulttoken")) return reject("defaulttoken not found");
    //if (hasNot("tags")) return reject("tags not found");
    //if (hasNot("controlledby")) return reject("controlledby not found");
    //if (hasNot("inplayerjournals")) return reject("inplayerjournals not found");
    //if (hasNot("attribs")) return reject("attribs not found");
    //if (hasNot("abilities")) return reject("abilities not found");

    let idx = 0;
    for (let el of data.attribs) {
      if (!("name" in el)) return reject(`Attribute index ${idx} doesn't have name`);
      if (!("current" in el)) return reject(`Attribute index ${idx} doesn't have current`);
      if (!("max" in el)) return reject(`Attribute index ${idx} doesn't have max`);
      if (!("id" in el)) return reject(`Attribute index ${idx} doesn't have id`);
      idx++;
    }

    idx = 0;
    for (let el of data.abilities) {
      if (!("name" in el)) return reject(`Ability index ${idx} doesn't have name`);
      if (!("description" in el)) return reject(`Ability index ${idx} doesn't have description`);
      if (!("istokenaction" in el)) return reject(`Ability index ${idx} doesn't have istokenaction`);
      if (!("action" in el)) return reject(`Ability index ${idx} doesn't have action`);
      if (!("order" in el)) return reject(`Ability index ${idx} doesn't have order`);
      idx++;
    }

    R20.wipeObjectStorage(pc.abilities);
    R20.wipeObjectStorage(pc.attribs);

    // some attributes store the id of the exported character
    // we replace them here with the new id 

    if(data.oldId) {
      let jsonData = JSON.stringify(data);
      jsonData = replaceAll(jsonData, data.oldId, pc.attributes.id);
      data = JSON.parse(jsonData);
    }

    // replace represents id
    const hasToken = data.defaulttoken && data.defaulttoken.length > 0;

    if(data.oldId) {
      if (hasToken) {
        data.defaulttoken = replaceAll(data.defaulttoken, data.oldId, pc.attributes.id);
      }
    }

    let save = {...get_default_character_save(), ...data};
    save.defaulttoken= "";

    {
      let blobs = get_default_character_blobs();

      if(data.bio) {
        blobs.bio = data.bio;
      }

      if(R20.isGM() && data.gmnotes) {
        blobs.gmnotes = data.gmnotes
      }

      if (hasToken) {
        blobs.defaulttoken = data.defaulttoken;
        save.defaulttoken = (new Date).getTime();
      } else {
        blobs.defaulttoken = null;
        save.defaulttoken = "";
      }

      pc.updateBlobs(blobs);
    }

    for(let importAttrib of data.attribs) {
      pc.attribs.create(importAttrib);
    }

    for(let abil of data.abilities) {
      pc.abilities.create(abil);
    }

    pc.save(save, { success: (v) => {
      resolve();
    }});
  });
}

const overwrite_handout_v3 = (handout: Handout , data: any): Promise<any> => {
  return new Promise((resolve, reject) => {

    let save = {
      archived: data.archived || false,
      avatar: data.avatar || "",
      controlledby: data.controlledby || "",
      inplayerjournals: data.inplayerjournals || "",
      name: data.name || "",
      tags: data.tags || "[]",
    };

    {
      let blobs: any = {
        notes: data.notes || "",
      };

      if(R20.isGM() && data.gmnotes) {
        blobs.gmnotes = data.gmnotes || "";
      }

      //console.log("blobs", blobs);

      handout.updateBlobs(blobs);
    }

    //console.log("save", save);

    handout.save(save, { success: (v) => {
      resolve();
    }});
  });
}

class CharacterIOModule extends R20Module.OnAppLoadBase {
  static readonly journalWidgetId = "r20es-character-io-journal-widget";
  static readonly overwriteButtonClass = "r20es-sheet-overwrite-button";

  sheetTab: any = null;

  constructor() {
    super(__dirname);
  }

  on_journal_file_change = (e: any) => {
    const btn = $(e.target.parentNode).find("button")[0];
    console.log(btn);
    btn.disabled = !(e.target.files.length > 0);
  }

  try_convert_file_handle_to_json = async (handle: File) => {
    const str = await readFile(handle) as string;

    let data = null;

    try {
      data = JSON.parse(str);
    } 
    catch (err) {
      console.log(err);
      throw "File is not a valid JSON file.";
    }

    if(!data) {
      throw "Data is null";
    }

    return data;
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
      const data = await this.try_convert_file_handle_to_json(handle);
      const version = data.schema_version;

      if(version == 1) {
        const pc = R20.createCharacter();
        try {
          await overwrite_char_v1(pc, data);
        }
        catch(e) {
          pc.destroy();
          throw e;
        }
      }
      else if(version == 2) {
        const pc = R20.createCharacter();
        try {
          await overwrite_char_v2(pc, data);
        }
        catch(e) {
          pc.destroy();
          throw e;
        }
      }
      else if(version == 3) {
        if(data.type == "character") {
          const pc = R20.createCharacter();
          try {
            await overwrite_char_v2(pc, data.character);
          }
          catch(e) {
            pc.destroy();
            throw e;
          }
        }
        else if(data.type == "handout") {
          const handout = R20.create_handout();
          try {
            await overwrite_handout_v3(handout, data.handout);
          }
          catch(e) {
            handout.destroy();
            throw e;
          }
        }
        else {
          throw `Unknown type: ${data.type}`;
        }
      }
      else {
        throw `Unknown schema version: ${data.schema_version}`;
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
          VTTES Importer
        </SidebarCategoryTitle>

        <button 
          className="btn" 
          style={{ display: "block", float: "left", width: "90%", marginBottom: "10px" }} 
          onClick={this.on_import_click}
        >
          Import Characters & Handouts
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

  on_export_click = async (e: any) => {
    e.stopPropagation();

    const pc = this.getPc(e.target);

    if (!pc) {
      return;
    }

    const blobPromise = new Promise(
      ok => pc._getLatestBlob("defaulttoken", 
        () => { 
          ok(false);
        }
      )
    );

    // NOTE(justasd): 3 second timeout for the blobpromise
    const waitPromise = promiseWait(3000, true);

    await Promise.race([blobPromise, waitPromise]);

    let data = {
      schema_version: 3,
      type: "character",

      character: {
        oldId: pc.attributes.id || "",
        name: pc.attributes.name || "",
        avatar: pc.attributes.avatar || "",
        bio: pc._blobcache.bio || "",
        gmnotes: pc._blobcache.gmnotes || "",
        defaulttoken: pc._blobcache.defaulttoken || "",
        tags: pc.attributes.tags || "",
        controlledby: pc.attributes.controlledby || "",
        inplayerjournals: pc.attributes.inplayerjournals || "",
        attribs: [],
        abilities: []
      }
    };

    for (let attrib of pc.attribs.models) {
      data.character.attribs.push({
        name: attrib.attributes.name,
        current: attrib.attributes.current,
        max: attrib.attributes.max,
        id: attrib.attributes.id,
      });
    }

    for (let abil of pc.abilities.models) {
      data.character.abilities.push({
        name: abil.attributes.name,
        description: abil.attributes.description,
        istokenaction: abil.attributes.istokenaction,
        action: abil.attributes.action,
        order: abil.attributes.order
      });
    }

    const file_name = data.character.name + ".json";

    const json_data = JSON.stringify(data, null, 4);

    const json_blob = new Blob([json_data], { type: 'data:application/javascript;charset=utf-8' });
    saveAs(json_blob, file_name);
  }

  on_overwrite_character_click = (e: any) => {
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
        const data = await this.try_convert_file_handle_to_json(f_handle);

        if(data.schema_version == 1) {
          await overwrite_char_v1(pc, data);
        }
        else if(data.schema_version == 2) {
          await overwrite_char_v2(pc, data);
        }
        else if(data.schema_version == 3) {
          if(data.type == "character") {
            await overwrite_char_v2(pc, data.character);
          }
          else if(data.type == "handout") {
            throw `Cannot overwrite a character with a handout file.`;
          }
          else {
            throw `Unsupported type : ${data.type}`;
          }
        }
        else {
          throw `Unsupported version: ${data.schema_version}`;
        }
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

  render_character_tab_widget = (data: SheetTabSheetInstanceData<any>) => {
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
          onClick={this.on_overwrite_character_click} 
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
    this.sheetTab = SheetTab.add("Export & Overwrite", this.render_character_tab_widget);
    this.add_journal_widget();

    window.r20es.overwrite_handout = async (e) => {
      e.stopPropagation();

      const id = $(e.target).parents(".ui-dialog-titlebar").siblings(".dialog").attr("data-handoutid");
      const handout = R20.getHandout(id);

      if(!handout) {
        alert("Failed to find handout associated with dialog!");
        return;
      }

      const file_selector_element = (
        <input 
          type="file"
          accept=".json"
        />
      );
      
      const listener = async () => {
        file_selector_element.removeEventListener("change", listener);
        const f_handle = file_selector_element.files[0];

        if (!window.confirm(`Are you sure you want to overwrite ${handout.get("name")}`)) {
          return;
        }

        let plsWait = new LoadingDialog("Overwriting");
        plsWait.show();

        try {
          const data = await this.try_convert_file_handle_to_json(f_handle);
          console.log(handout);

          if(data.schema_version == 3) {
            if(data.type == "character") {
              throw `Cannot overwrite a handout with a character file.`;
            }
            else if(data.type == "handout") {
              await overwrite_handout_v3(handout, data.handout);
            }
            else {
              throw `Unsupported type : ${data.type}`;
            }
          }
          else {
            throw `Unsupported version: ${data.schema_version}`;
          }
        }
        catch(e) {
          alert(e);
          console.log(e);
        }

        plsWait.dispose();
      };

      file_selector_element.click();
      file_selector_element.addEventListener("change", listener);
    };

    window.r20es.export_handout = async (e) => {
      const id = $(e.target).parents(".ui-dialog-titlebar").siblings(".dialog").attr("data-handoutid");
      const handout = R20.getHandout(id);

      if(!handout) {
        alert("Failed to find handout associated with dialog!");
        return;
      }

      const blobPromise = (name) => new Promise(
        ok => handout._getLatestBlob(name, () => ok())
      );

      const blob_promises = [blobPromise("notes")];

      if(R20.isGM()) {
        blob_promises.push(blobPromise("gmnotes"));
      }

      await Promise.race([
        promiseWait(3000),
        Promise.all(blob_promises),
      ]);

      let data = {
        schema_version: 3,
        type: "handout",

        handout: {
          archived: handout.attributes.archived || false,
          avatar: handout.attributes.avatar || "",
          controlledby: handout.attributes.controlledby || "",
          inplayerjournals: handout.attributes.inplayerjournals || "",
          name: handout.attributes.name || "",
          tags: handout.attributes.tags || "[]",
          gmnotes: "",
          notes: handout._blobcache.notes || "",
        }
      };

      if(R20.isGM()) {
        data.handout.gmnotes = handout._blobcache.gmnotes || "";
      }

      const file_name = data.handout.name + ".json";
      const json_data = JSON.stringify(data, null, 4);
      const json_blob = new Blob([json_data], { type: 'data:application/javascript;charset=utf-8' });
      saveAs(json_blob, file_name);
    };
  }

  dispose = () => {
    super.dispose();

    if (this.sheetTab) this.sheetTab.dispose();
    findByIdAndRemove(CharacterIOModule.journalWidgetId);

    window.r20es.export_handout = null;
  }
}

if (R20Module.canInstall()) new CharacterIOModule().install();
