import { R20Module } from '../../utils/R20Module'
import { R20 } from '../../utils/R20'
import { DOM, SidebarSeparator, SidebarCategoryTitle } from '../../utils/DOM'
import { saveAs } from 'save-as'
import { createCSSElement, findByIdAndRemove, readFile, safeParseJson } from '../../utils/MiscUtils';
import { SheetTab, SheetTabSheetInstanceData } from '../../utils/SheetTab';
import { LoadingDialog } from '../../utils/DialogComponents';
import { import_multiple_files } from "../../utils/import_multiple_files";
import {replaceAll} from "../../utils/MiscUtils";
import { promiseWait } from "../../utils/promiseWait";
import {DialogBase} from "../../utils/DialogBase";
import {Dialog, DialogBody, DialogFooter, DialogFooterContent, DialogHeader} from "../../utils/DialogComponents";
import { zipSync, strToU8} from 'fflate';
import lexCompare from "../../utils/LexicographicalComparator";

interface Character_Ability_Bundle_Export {
  schema_version: number;
  type: "vttes_character_ability_bundle";
  abilities: Array<Character_Ability_Export>;
}

interface Character_Ability_Export {
  id: string;
  name: string;
  description: string;
  istokenaction: boolean;
  action: string;
  order: number;
}

interface Component_Bundle_Export {
  schema_version: number;
  type: "vttes_component_bundle";
  components: Array<Component_Export>;
}

interface Component_Export {
  name: string;
  type: string;
  repeating_id: string;
  old_character_id: string;
  attributes: Array<Roll20.CharacterSheetAttributeAttributes>;
}

interface Import_Dialog_Type_Group {
  name: string;
  components: Array<Component_Export>;
}

interface Import_Dialog_Imported_Attribute {
  old_repeating_id: string;
  new_repeating_id: string;
  attribute: Roll20.CharacterSheetAttribute;
}

class Import_Component_Dialog extends DialogBase<string> {

  pc: Roll20.Character;
  types: Array<Import_Dialog_Type_Group> = [];
  import_button: HTMLButtonElement;
  num_checked = 0;

  public constructor() {
    super(undefined, {minWidth: "30%"});
  }

  update_import_button_state = () => {
    if(this.num_checked <= 0) {
      this.import_button.disabled = true;
    }
    else {
      this.import_button.disabled = false;
    }
  }

  on_check = (e) => {
    var el = e.target as HTMLInputElement;
    if(el.checked) {
      this.num_checked += 1;
    }
    else {
      this.num_checked -= 1;
    }

    this.update_import_button_state();
  }

  public show(pc: Roll20.Character, data: Component_Bundle_Export) {
    this.types = [];
    this.pc = pc;
    this.num_checked = 0;

    this.types = [];
    for(const component of data.components) {
      var type = this.types.find(t => t.name === component.type);
      if(!type) {
        type = {
          name: component.type,
          components: [],
        };
        this.types.push(type);
      }

      type.components.push(component);
    }

    this.types.sort((a, b) => lexCompare(a, b, (d) => d.name));

    super.internalShow();
  }

  on_click_import = (e) => {
    const root = this.getRoot();
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    const components = [];

    for(const el of all_els) {
      if(!el.checked) continue;

      var repeating_id = el.getAttribute("repeating_id");

      for(const type of this.types) {
        for(const component of type.components) {
          if(component.repeating_id === repeating_id) {
            components.push(component);
          }
        }
      }
    }

    const imported_attributes: Array<Import_Dialog_Imported_Attribute> = [];
    for(const component of components) {
      const new_repeating_id = R20.generate_repeating_uuid();

      for(const attribute of component.attributes) {

        //var new_id = "";
        //if(attribute.id.includes(component.repeating_id)) {
        //  replaceAll(attribute.id, component.repeating_id, new_repeating_id);
        //}
        //else {
        //  new_id = R20.generateUUID();
        //}

        const data = {
          name: replaceAll(attribute.name || "", component.repeating_id, new_repeating_id),
          current: attribute.current,
          max: attribute.max,
        };

        // NOTE(justasd): Some properties (such as rollcontent in 5e ogl) explicitly reference the
        // id of the parent character. We hope to rebase the character ids by replacing the old
        // one char id with the new parent char id here.
        // 2021-06-27
        if(typeof(data.current) === "string") {
          data.current = replaceAll(attribute.current || "", component.old_character_id, this.pc.attributes.id);
        }
        if(typeof(data.max) === "string") {
          data.max = replaceAll(attribute.max || "", component.old_character_id, this.pc.attributes.id);
        }

        const new_attrib = this.pc.attribs.create(data, { silent: true });

        imported_attributes.push({
          old_repeating_id: component.repeating_id,
          new_repeating_id: new_repeating_id,
          attribute: new_attrib,
        });
      }
    }
  
    // NOTE(justasd): resolve cross-component references. In 5e ogl spell attacks components
    // reference spell component descriptions by repeating id. So without this, if we import a spell
    // with its spell component and attack component, the attack component's "show description"
    // button will not work as it will not find the proper spell component.
    // 2021-06-27
    for(let outer_it = 0; outer_it < imported_attributes.length; ++outer_it) {
      for(let inner_it = outer_it + 1; inner_it < imported_attributes.length; ++inner_it) {
        const outer = imported_attributes[outer_it];
        const inner = imported_attributes[inner_it];

        const replace = (a: Import_Dialog_Imported_Attribute, b: Import_Dialog_Imported_Attribute) => {
          if(typeof(a.attribute.attributes.current) !== "string") return;

          if(a.attribute.attributes.current.includes(b.old_repeating_id)) {
            a.attribute.save({
              current: replaceAll(a.attribute.attributes.current || "", b.old_repeating_id, b.new_repeating_id),
            });
          }
        }

        replace(outer, inner);
        replace(inner, outer);
      }
    }

    this.close();
  }

  on_select_all = (e) => {
    const root = e.target.parentElement.parentElement;
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(!el.checked) {
        el.checked = true;
        this.num_checked += 1;
      }
    }
    this.update_import_button_state();
  }

  on_unselect_all = (e) => {
    const root = e.target.parentElement.parentElement;
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(el.checked) {
        el.checked = false;
        this.num_checked -= 1;
      }
    }
    this.update_import_button_state();
  }

  on_select_all_checkboxes = (e) => {
    const root = e.target.parentElement.parentElement;
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(!el.checked) {
        el.checked = true;
        this.num_checked += 1;
      }
    }

    this.update_import_button_state();
  }


  on_unselect_all_checkboxes = (e) => {
    const root = e.target.parentElement.parentElement;
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      el.checked = false;
    }

    this.num_checked = 0;
    this.update_import_button_state();
  }

  protected render() {

    const rows = [];

    for(const type of this.types) {
      const data = [];

      for(const component of type.components) {

        const checkbox = (<input 
          className="vttes-component" 
          type="checkbox" 
          checked={true}
          onChange={this.on_check}
          style={{marginRight: "4px"}}
        />);
        this.num_checked += 1;

        checkbox.setAttribute("repeating_id", component.repeating_id);

        const el = (
          <div>
            {checkbox}
            {component.name}
          </div>
        );
        data.push(el);
      }

      rows.push(
        <div style={{minWidth: "180px"}}>
          <hr/>
          <h3 style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr",
            gridGap: "5px",
            alignItems: "center",
          }}>
            {type.name}
            <button className="btn" onClick={this.on_select_all}>Select All</button>
            <button className="btn" onClick={this.on_unselect_all}>Unselect All</button>
          </h3>
          <div>
            {data}
          </div>
        </div>
      );
    }

    this.import_button = (
      <input 
        className="r20btn btn btn-success" 
        type="button" 
        onClick={this.on_click_import} 
        value="Import Selected"
        disabled={true}
      />
    );
    if(this.num_checked > 0) {
      this.import_button.disabled = false;
    }

    return (
      <Dialog>
        <DialogHeader>
          <h2>Component Import</h2>
        </DialogHeader>

        <DialogBody>
            
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          }}>
            <button className="btn" onClick={this.on_select_all_checkboxes}>Select All</button>
            <button className="btn" onClick={this.on_unselect_all_checkboxes}>Unselect All</button>
          </div>
          {rows}
        </DialogBody>

        <DialogFooter>
          <DialogFooterContent >
            <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gridGap: "16px"}}>
              <input className="r20btn btn" type="button" onClick={this.close} value="Close" />
              {this.import_button}
            </div>
          </DialogFooterContent>
        </DialogFooter>
      </Dialog>
    );
  }
}

interface Export_Dialog_Type_Group {
  key: string;
  components: Array<Export_Dialog_Component_Group>;
}

interface Export_Dialog_Component_Group {
  repeating_id: string;
  name: string;
  properties: Array<Export_Dialog_Component_Property>;
}

interface Export_Dialog_Component_Property {
  name: string;
  attribute: Roll20.CharacterSheetAttributeAttributes;
}

class Export_Component_Dialog extends DialogBase<string> {

  pc: Roll20.Character;
  types: Array<Export_Dialog_Type_Group> = [];

  export_individual_files = false;
  num_checked = 0;
  export_button: HTMLButtonElement;

  public constructor() {
    super(undefined, {minWidth: "30%"});
  }

  public show(pc: Roll20.Character) {
    this.pc = pc;
    this.num_checked = 0;
    super.internalShow();
  }

  update_export_button_state = () => {
    if(this.num_checked <= 0) {
      this.export_button.disabled = true;
    }
    else {
      this.export_button.disabled = false;
    }
  }

  on_check = (e) => {
    var el = e.target as HTMLInputElement;
    if(el.checked) {
      this.num_checked += 1;
    }
    else {
      this.num_checked -= 1;
    }

    this.update_export_button_state();
  }

  on_click_export = (e) => {
    const root = this.getRoot();
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    const all_components: Array<Component_Export> = [];

    for(const el of all_els) {
      if(!el.checked) continue;

      var type_key = el.getAttribute("type_key");
      var repeating_id = el.getAttribute("repeating_id");
      var name = el.getAttribute("name");

      var type = this.types.find(t => t.key === type_key);
      if(!type) {
        console.error(`Could not find type with key '${type_key}'. Type array is`, this.types);
        continue;
      }

      var component = type.components.find(c => c.repeating_id === repeating_id);
      if(!component) {
        console.error(`Could not find component with repeating id '${repeating_id}'. Type array is`, this.types, "component array is", component);
        continue;
      }

      var attributes: Array<Roll20.CharacterSheetAttributeAttributes> = [];
      for(const prop of component.properties) {
        attributes.push(prop.attribute);
      }

      all_components.push({
        name: name,
        type: this.get_type_name(type_key),
        repeating_id: repeating_id,
        old_character_id: this.pc.attributes.id,
        attributes: attributes,
      });
    }

    if(this.export_individual_files) {
      let fs = {};

      for(const component of all_components) {
        let key = `${this.pc.attributes.name} ${component.type} ${component.name} ${component.repeating_id}.vttes_component_bundle`;

        // NOTE(justasd): path separators make the fflate confused so we yeet them
        // 2021-06-26
        key = replaceAll(key, "/", "");
        key = replaceAll(key, "\\", "");

        let data: Component_Bundle_Export = {
          schema_version: 1,
          type: "vttes_component_bundle",
          components: [ component ],
        };

        const json = JSON.stringify(data, null, 2);
        const bytes = strToU8(json);

        fs[key] = bytes;
      }

      const zipped = zipSync(fs);

      const zip_blob = new Blob([zipped], { type: 'application/octet-stream' });
      var file_name = "Components from " + this.pc.attributes.name + ".zip";

      saveAs(zip_blob, file_name);
    }
    else {
      let data: Component_Bundle_Export = {
        schema_version: 1,
        type: "vttes_component_bundle",
        components: all_components,
      };

      const file_name = "Components from " + this.pc.attributes.name + ".vttes_component_bundle";

      const json_data = JSON.stringify(data, null, 2);
      const json_blob = new Blob([json_data], { type: 'data:application/javascript;charset=utf-8' });
      saveAs(json_blob, file_name);
    }
    this.close();
  }

  on_select_all = (e) => {
    const root = e.target.parentElement.parentElement;
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(!el.checked) {
        el.checked = true;
        this.num_checked += 1;
      }
    }
    this.update_export_button_state();
  }

  on_unselect_all = (e) => {
    const root = e.target.parentElement.parentElement;
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(el.checked) {
        el.checked = false;
        this.num_checked -= 1;
      }
    }
    this.update_export_button_state();
  }

  on_select_all_checkboxes = (e) => {
    const root = e.target.parentElement.parentElement;
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(!el.checked) {
        el.checked = true;
        this.num_checked += 1;
      }
    }

    this.update_export_button_state();
  }

  get_type_name = (type_key) => {
    if(type_key === "attack") return "Attack";
    else if(type_key === "inventory") return "Item";
    else if(type_key === "proficiencies") return "Proficiency";
    else if(type_key === "spell-1") return "Spell (lv 1)";
    else if(type_key === "spell-2") return "Spell (lv 2)";
    else if(type_key === "spell-3") return "Spell (lv 3)";
    else if(type_key === "spell-4") return "Spell (lv 4)";
    else if(type_key === "spell-5") return "Spell (lv 5)";
    else if(type_key === "spell-6") return "Spell (lv 6)";
    else if(type_key === "spell-7") return "Spell (lv 7)";
    else if(type_key === "spell-8") return "Spell (lv 8)";
    else if(type_key === "spell-9") return "Spell (lv 9)";
    else if(type_key === "spell-cantrip") return "Cantrip";
    else if(type_key === "tool") return "Tool";
    else if(type_key === "traits") return "Trait";
    else if(type_key === "npctrait") return "NPC Trait";
    else if(type_key === "npcaction") return "NPC Action";
    else if(type_key === "npcaction-l") return "NPC Legendary Action";
    return type_key;
  }

  protected render() {

    this.types = [];

    for(const attrib of this.pc.attribs.models) {
      var split = attrib.attributes.name.split("_");
      if(split.length < 4) continue;
      if(split[0] !== "repeating") continue;

      let type_key = split[1];
      var repeating_id = split[2];

      var sliced = split.slice(3, split.length);
      var property = sliced.join("_");

      var type = this.types.find(t => t.key === type_key);
      if(!type) {
        type = {
          key: type_key,
          components: [],
        };
        this.types.push(type);
      }

      var component = type.components.find(c => c.repeating_id === repeating_id);
      if(!component) {
        component = {
          repeating_id: repeating_id,
          name: "",
          properties: [],
        };
        type.components.push(component);
      }

      component.properties.push({
        name: property,
        attribute: attrib.attributes,
      });
    }
  
    var preset_order: { [key: string]: number } | null = null;
    {
      var repeating_action_order_key = this.pc.attribs.models.find(
        a => a.attributes.name === "_reporder_repeating_actions"
      );

      if(repeating_action_order_key) {
        preset_order = {};
        var split = repeating_action_order_key.attributes.current.split(',');

        for(var index = 0; index < split.length; index++) {
          var key = split[index];
          preset_order[key] = index;
        }
      }
    }
    
    for(const type of this.types) {
      for(const component of type.components) {

        const get_name_from = (name) => {
          for(const prop of component.properties) {
            if(prop.name === name) {
              return prop.attribute.current;
            }
          }

          return name;
        };

        var name = component.repeating_id;
        if(type.key === "attack") name = get_name_from("atkname");
        else if(type.key === "inventory") name = get_name_from("itemname");
        else if(type.key === "proficiencies") name = get_name_from("name");
        else if(type.key === "spell-1") name = get_name_from("spellname");
        else if(type.key === "spell-2") name = get_name_from("spellname");
        else if(type.key === "spell-3") name = get_name_from("spellname");
        else if(type.key === "spell-4") name = get_name_from("spellname");
        else if(type.key === "spell-5") name = get_name_from("spellname");
        else if(type.key === "spell-6") name = get_name_from("spellname");
        else if(type.key === "spell-7") name = get_name_from("spellname");
        else if(type.key === "spell-8") name = get_name_from("spellname");
        else if(type.key === "spell-9") name = get_name_from("spellname");
        else if(type.key === "spell-cantrip") name = get_name_from("spellname");
        else if(type.key === "tool") name = get_name_from("toolname");
        else if(type.key === "traits") name = get_name_from("name"); 
        else if(type.key === "npctrait") name = get_name_from("name"); 
        else if(type.key === "npcaction") name = get_name_from("name"); 
        else if(type.key === "npcaction-l") name = get_name_from("name"); 
        else {
          // NOTE(justasd): try guessing
          for(const prop of component.properties) {
            if(prop.name.includes("name")) {
              name = prop.attribute.current;
              break;
            }
          }
        }

        component.name = name;
      }

      if(preset_order) {
        type.components.sort((a, b) => {
          var order_a = preset_order[a.repeating_id];
          var order_b = preset_order[b.repeating_id];
          if(typeof(order_a) == "number" && typeof(order_b) == "number") {
            return order_a - order_b;
          }
          return lexCompare(a, b, d => d.repeating_id);
        });
      }
      else {
        type.components.sort((a, b) => lexCompare(a, b, (d) => d.name));
      }
    }

    this.types.sort((a, b) => lexCompare(a, b, (d) => d.key));

    const columns = [];

    for(const type of this.types) {
      const data = [];
      var type_name = this.get_type_name(type.key);

      for(const component of type.components) {

        const checkbox = (<input 
          className="vttes-component" 
          type="checkbox" 
          onChange={this.on_check}
          style={{marginRight: "4px"}}
        />);

        checkbox.setAttribute("type_key", type.key);
        checkbox.setAttribute("repeating_id", component.repeating_id);
        checkbox.setAttribute("name", component.name);

        const el = (
          <div>
            {checkbox}
            {component.name}
          </div>
        );

        data.push(el);
      }

      const col = (
        <div style={{minWidth: "180px"}}>
          <hr/>
          <h3 style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr",
            gridGap: "5px",
            alignItems: "center",
          }}>
            {type_name}
            <button className="btn" onClick={this.on_select_all}>Select All</button>
            <button className="btn" onClick={this.on_unselect_all}>Unselect All</button>
          </h3>
          <div>
            {data}
          </div>
        </div>
      );
      columns.push(col);
    }

    this.export_button = <input disabled={true} className="r20btn btn btn-success" type="button" onClick={this.on_click_export} value="Export Selected" />

    const zip_checkbox = (
      <input 
        checked={this.export_individual_files}
        type="checkbox" style={{marginRight: "4px"}}
        onChange={(e) => { this.export_individual_files = e.target.checked; }}
      />
    );

    return (
      <Dialog>
        <DialogHeader>
          <h2>Component Export</h2>
        </DialogHeader>

        <DialogBody>
          <div style={{display: "grid"}}>
            <button className="btn" onClick={this.on_select_all_checkboxes}>Select All</button>
          </div>
          {columns}
        </DialogBody>

        <DialogFooter>
          <DialogFooterContent >
            <div style={{display:"grid"}}>
              <div style={{marginBottom: "10px"}}>
                {zip_checkbox}
                <span style={{cursor: "pointer"}} onclick={() => zip_checkbox.click()}>
                  Export to individual files, zipped.
                </span>
              </div>

              <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gridGap: "16px"}}>
                <input className="r20btn btn" type="button" onClick={this.close} value="Close" />
                {this.export_button}
              </div>

            </div>
          </DialogFooterContent>
        </DialogFooter>
      </Dialog>

    );
  }
}

class Import_Ability_Dialog extends DialogBase<string> {

  pc: Roll20.Character;
  import_button: HTMLButtonElement;
  num_checked = 0;
  data: Character_Ability_Bundle_Export;

  public constructor() {
    super(undefined, {minWidth: "30%"});
  }

  update_import_button_state = () => {
    if(this.num_checked <= 0) {
      this.import_button.disabled = true;
    }
    else {
      this.import_button.disabled = false;
    }
  }

  on_check = (e) => {
    var el = e.target as HTMLInputElement;
    if(el.checked) {
      this.num_checked += 1;
    }
    else {
      this.num_checked -= 1;
    }

    this.update_import_button_state();
  }

  public show(pc: Roll20.Character, data: Character_Ability_Bundle_Export) {
    this.pc = pc;
    this.num_checked = 0;
    this.data = data;

    super.internalShow();
  }

  on_click_import = (e) => {
    const root = this.getRoot();
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(!el.checked) {
        var id = el.getAttribute("id");

        var found = false;
        for(var index = 0; index < this.data.abilities.length; index++) {
          var ability = this.data.abilities[index];
          if(ability.id == id) {
            found = true;
            this.data.abilities.splice(index, 1);
            break;
          }
        }

        if(!found) {
          console.error(`Could not find ability with id '${id}'.`);
        }
      }
    }

    for(const ability of this.data.abilities) {
      this.pc.abilities.create({
        id: R20.generateUUID(),
        name: ability.name,
        description: ability.description,
        istokenaction: ability.istokenaction,
        action: ability.action,
        order: ability.order
      });
    }
 
    this.close();

    R20.rerender_character_sheet(this.pc);
  }

  on_select_all = (e) => {
    const root = e.target.parentElement.parentElement;
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(!el.checked) {
        el.checked = true;
        this.num_checked += 1;
      }
    }
    this.update_import_button_state();
  }

  on_unselect_all = (e) => {
    const root = e.target.parentElement.parentElement;
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(el.checked) {
        el.checked = false;
        this.num_checked -= 1;
      }
    }
    this.update_import_button_state();
  }

  protected render() {

    const rows = [];

    for(const ability of this.data.abilities) {
      const checkbox = (<input 
        className="vttes-component" 
        type="checkbox" 
        onChange={this.on_check}
        style={{marginRight: "4px"}}
        checked={true}
      />);

      this.num_checked += 1;

      checkbox.setAttribute("id", ability.id);

      const el = (
        <div>
          {checkbox}
          {ability.name}
        </div>
      );

      rows.push(el);
    }

    this.import_button = (
      <input 
        className="r20btn btn btn-success" 
        type="button" 
        onClick={this.on_click_import} 
        value="Import Selected"
        disabled={true}
      />
    );
    if(this.num_checked > 0) {
      this.import_button.disabled = false;
    }


    return (
      <Dialog>
        <DialogHeader>
          <h2>Ability Import</h2>
        </DialogHeader>

        <DialogBody>
            
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          }}>
            <button className="btn" onClick={this.on_select_all}>Select All</button>
            <button className="btn" onClick={this.on_unselect_all}>Unselect All</button>
          </div>
          {rows}
        </DialogBody>

        <DialogFooter>
          <DialogFooterContent >
            <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gridGap: "16px"}}>
              <input className="r20btn btn" type="button" onClick={this.close} value="Close" />
              {this.import_button}
            </div>
          </DialogFooterContent>
        </DialogFooter>
      </Dialog>
    );
  }
}

class Export_Ability_Dialog extends DialogBase<string> {

  pc: Roll20.Character;

  export_individual_files = false;
  num_checked = 0;
  export_button: HTMLButtonElement;
  abilities: Array<Character_Ability_Export>

  public constructor() {
    super(undefined, {minWidth: "30%"});
  }

  public show(pc: Roll20.Character) {
    this.pc = pc;
    this.num_checked = 0;
    this.abilities = [];

    for(const ability of this.pc.abilities.models) {
      this.abilities.push({
        action: ability.attributes.action,
        description: ability.attributes.description,
        id: ability.id,
        istokenaction: ability.attributes.istokenaction,
        name: ability.attributes.name,
        order: ability.attributes.order
      });
    }

    //this.abilities.sort((a, b) => lexCompare(a, b, (d) => d.name));

    super.internalShow();
  }

  update_export_button_state = () => {
    if(this.num_checked <= 0) {
      this.export_button.disabled = true;
    }
    else {
      this.export_button.disabled = false;
    }
  }

  on_check = (e) => {
    var el = e.target as HTMLInputElement;
    if(el.checked) {
      this.num_checked += 1;
    }
    else {
      this.num_checked -= 1;
    }

    this.update_export_button_state();
  }

  on_click_export = (e) => {
    const root = this.getRoot();
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(!el.checked) {
        var id = el.getAttribute("id");

        var found = false;
        for(var index = 0; index < this.abilities.length; index++) {
          var ability = this.abilities[index];
          if(ability.id == id) {
            found = true;
            this.abilities.splice(index, 1);
            break;
          }
        }

        if(!found) {
          console.error(`Could not find ability with id '${id}'.`);
        }
      }
    }

    console.log(this.abilities);

    if(this.export_individual_files) {
      let fs = {};

      for(const ability of this.abilities) {
        let key = `${this.pc.attributes.name} ${ability.name} ${ability.id}.vttes_character_ability_bundle`;

        // NOTE(justasd): path separators make the fflate confused so we yeet them
        // 2021-06-26
        key = replaceAll(key, "/", "");
        key = replaceAll(key, "\\", "");

        let data: Character_Ability_Bundle_Export = {
          schema_version: 1,
          type: "vttes_character_ability_bundle",
          abilities: [ ability ],
        };

        const json = JSON.stringify(data, null, 2);
        const bytes = strToU8(json);

        fs[key] = bytes;
      }

      const zipped = zipSync(fs);

      const zip_blob = new Blob([zipped], { type: 'application/octet-stream' });
      var file_name = "Abilities from " + this.pc.attributes.name + ".zip";

      saveAs(zip_blob, file_name);
    }
    else {
      let data: Character_Ability_Bundle_Export = {
        schema_version: 1,
        type: "vttes_character_ability_bundle",
        abilities: this.abilities,
      };

      const file_name = "Abilities from " + this.pc.attributes.name + ".vttes_character_ability_bundle";

      const json_data = JSON.stringify(data, null, 2);
      const json_blob = new Blob([json_data], { type: 'data:application/javascript;charset=utf-8' });
      saveAs(json_blob, file_name);
    }
    this.close();
  }

  on_select_all = (e) => {
    const root = e.target.parentElement.parentElement;
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(!el.checked) {
        el.checked = true;
        this.num_checked += 1;
      }
    }
    this.update_export_button_state();
  }

  on_unselect_all = (e) => {
    const root = e.target.parentElement.parentElement;
    const all_els = root.querySelectorAll(`input.vttes-component`) as any as any[];

    for(const el of all_els) {
      if(el.checked) {
        el.checked = false;
        this.num_checked -= 1;
      }
    }
    this.update_export_button_state();
  }

  protected render() {

    const rows = [];
    for(const ability of this.abilities) {
      const checkbox = (<input 
        className="vttes-component" 
        type="checkbox" 
        onChange={this.on_check}
        style={{marginRight: "4px"}}
      />);

      checkbox.setAttribute("id", ability.id);

      const el = (
        <div>
          {checkbox}
          {ability.name}
        </div>
      );

      rows.push(el);
    }

    this.export_button = (
      <input 
        disabled={true} 
        className="r20btn btn btn-success" 
        type="button" 
        onClick={this.on_click_export} 
        value="Export Selected"
      />
    );

    const zip_checkbox = (
      <input 
        checked={this.export_individual_files}
        type="checkbox" style={{marginRight: "4px"}}
        onChange={(e) => { this.export_individual_files = e.target.checked; }}
      />
    );

    return (
      <Dialog>
        <DialogHeader>
          <h2>Ability Export</h2>
        </DialogHeader>

        <DialogBody>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridGap: "5px",
            alignItems: "center",
          }}>
            <button className="btn" onClick={this.on_select_all}>Select All</button>
            <button className="btn" onClick={this.on_unselect_all}>Unselect All</button>
          </div>
          {rows}
        </DialogBody>

        <DialogFooter>
          <DialogFooterContent >
            <div style={{display:"grid"}}>
              <div style={{marginBottom: "10px"}}>
                {zip_checkbox}
                <span style={{cursor: "pointer"}} onclick={() => zip_checkbox.click()}>
                  Export to individual files, zipped.
                </span>
              </div>

              <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gridGap: "16px"}}>
                <input className="r20btn btn" type="button" onClick={this.close} value="Close" />
                {this.export_button}
              </div>

            </div>
          </DialogFooterContent>
        </DialogFooter>
      </Dialog>

    );
  }
}

const get_default_character_save = (): any => {
  const data: any = {
    name: "",
    avatar: "",
    attrorder: "",
    abilorder: "",
    mancerdata: "",
    mancerget: "",
    mancerstep: "",
  };

  if(R20.isGM()) {
    data.archived = false;
    data.tags = "";
    data.controlledby = "";
    data.inplayerjournals = "";
    data.defaulttoken = "";
    data.bio = "";
    data.gmnotes = "";
  }
  return data;
};

const SHEET_ID = "r20es-handout-button-enabled-sheet";

const get_default_character_blobs = () => {
  const blob: Roll20.CharacterBlobs = {
    bio: null
  };

  if (R20.isGM()) {
    blob.defaulttoken = null;
    blob.gmnotes = null;
  }

  return blob;
};

const overwrite_char_v1 = (pc: Roll20.Character, data: any): Promise<any> => {
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

    pc.save(save, { success: (v) => {
      resolve();
    }});

    for(const attrib of data.attribs) {
      pc.attribs.create(attrib, { silent: true });
    }
  });
}

const overwrite_char_v2 = (pc: Roll20.Character, data: any): Promise<any> => {
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

    let save = {...get_default_character_save()};
    save.name = data.name;
    save.avatar = data.avatar;

    if(R20.isGM()) {
      save.tags = data.tags;
      save.controlledby = data.controlledby;
      save.inplayerjournals = data.inplayerjournals;
    }

    {
      let blobs = get_default_character_blobs();

      if(data.bio) {
        blobs.bio = data.bio;
      }

      if(R20.isGM() && data.gmnotes) {
        blobs.gmnotes = data.gmnotes
      }

      if(R20.isGM()) {
        if (hasToken) {
          blobs.defaulttoken = data.defaulttoken;
          save.defaulttoken = (new Date).getTime();
        } else {
          blobs.defaulttoken = null;
          save.defaulttoken = "";
        }
      }

      pc.updateBlobs(blobs);
    }

    pc.save(save, { success: (v) => {
      resolve();
    }});

    for(const attrib of data.attribs) {
      pc.attribs.create(attrib, { silent: true });
    }
    for(const ability of data.abilities) {
      pc.abilities.create(ability, { silent: true });
    }
  });
}

const overwrite_handout_v3 = (handout: Roll20.Handout , data: any): Promise<any> => {
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

  export_ability_dialog: Export_Ability_Dialog;
  import_ability_dialog: Import_Ability_Dialog;


  on_import_abilities_click = async (e: any) => {
    e.stopPropagation();

    const pc = this.getPc(e.target);
    if(!pc) return;

    const file_selector_element = (
      <input 
        type="file"
        accept=".vttes_character_ability_bundle"
      />
    );
    
    const listener = async () => {
      file_selector_element.removeEventListener("change", listener);
      const f_handle = file_selector_element.files[0];

      try {
        const data = await this.try_convert_file_handle_to_json(f_handle) as Character_Ability_Bundle_Export

        if(data.schema_version == 1) {
          if(data.type == "vttes_character_ability_bundle") {
            this.import_ability_dialog.show(pc, data);
          }
          else {
            throw `Unsupported data type: ${data.type}`;
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
    };

    file_selector_element.click();
    file_selector_element.addEventListener("change", listener);
  }

  on_export_abilities_click = (e: any) => {
    e.stopPropagation();

    const pc = this.getPc(e.target);
    if(!pc) return;

    this.export_ability_dialog.show(pc);
  }

  export_component_dialog: Export_Component_Dialog;
  import_component_dialog: Import_Component_Dialog;

  on_import_components_click = async (e: any) => {
    e.stopPropagation();

    const pc = this.getPc(e.target);
    if(!pc) return;

    const file_selector_element = (
      <input 
        type="file"
        accept=".vttes_component_bundle"
      />
    );
    
    const listener = async () => {
      file_selector_element.removeEventListener("change", listener);
      const f_handle = file_selector_element.files[0];

      try {
        const data = await this.try_convert_file_handle_to_json(f_handle) as Component_Bundle_Export;

        if(data.schema_version == 1) {
          if(data.type == "vttes_component_bundle") {
            this.import_component_dialog.show(pc, data);
          }
          else {
            throw `Unsupported data type: ${data.type}`;
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
    };

    file_selector_element.click();
    file_selector_element.addEventListener("change", listener);
  }

  on_export_components_click = (e: any) => {
    e.stopPropagation();

    const pc = this.getPc(e.target);
    if(!pc) return;

    this.export_component_dialog.show(pc);
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
        columnGap: "16px",
        rowGap: "32px",
      }}>
        <div>
          <div style={{width:"100%",display:"inline-block"}}>
            <h3>Export</h3>

            <p>
              Export this character as a VTTES character JSON file.
            </p>

          </div>

          <input 
            type="button" 
            onClick={this.on_export_click} 
            className="button" 
            style={{width:"auto"}}
            data-characterid={data.characterId}
            value="Export"
          />
        </div>

        <div>
          <div style={{width:"100%",display:"inline-block"}}>
            <h3>Overwrite</h3>

            <p>
              Overwrite this character with the character stored in the selected VTTES character JSON file.
            </p>
          </div>


          <input 
            type="button" 
            onClick={this.on_overwrite_character_click} 
            className="button" 
            style={{width:"auto"}}
            data-characterid={data.characterId}
            value={canEdit ? "Overwrite" : "You do not have permission to edit this character"}
            disabled={!canEdit}
          />
        </div>

        <div>
          <div style={{width:"100%",display:"inline-block"}}>
            <h3>Export Components</h3>

            <p>
              Export individual items, weapons, spells, traits etc of a character/NPC.
            </p>
            <p>
              <i>
              Note that only the D&D 5e OGL sheet is supported at the time. However, other sheets should work (albeit they won't be user-friendly).
              </i>
            </p>

          </div>

          <input 
            type="button" 
            className="button" 
            onClick={this.on_export_components_click} 
            style={{width:"auto"}}
            data-characterid={data.characterId}
            value="Export Components"
          />
        </div>

        <div>
          <div style={{width:"100%",display:"inline-block"}}>
            <h3>Import Components</h3>

            <p>
              Import components that were previously exported using the export components feature.
            </p>
          </div>

          <input 
            type="button" 
            className="button" 
            style={{width:"auto"}}
            onClick={this.on_import_components_click} 
            data-characterid={data.characterId}
            value={canEdit ? "Import Components" : "You do not have permission to edit this character"}
            disabled={!canEdit}
          />
        </div>

        <div>
          <div style={{width:"100%",display:"inline-block"}}>
            <h3>Export Abilities</h3>

            <p>
              Export character abilities individually or as a bundle.
            </p>

          </div>

          <input 
            type="button" 
            className="button" 
            onClick={this.on_export_abilities_click} 
            style={{width:"auto"}}
            data-characterid={data.characterId}
            value="Export Abilities"
          />
        </div>

        <div>
          <div style={{width:"100%",display:"inline-block"}}>
            <h3>Import Abilities</h3>

            <p>
              Export character abilities individually or as a bundle.
            </p>
          </div>

          <input 
            type="button" 
            className="button" 
            style={{width:"auto"}}
            onClick={this.on_import_abilities_click} 
            data-characterid={data.characterId}
            value={canEdit ? "Import Abilities" : "You do not have permission to edit this character"}
            disabled={!canEdit}
          />
        </div>
      </div>
    )
  };

  setup = () => {
    this.export_component_dialog = new Export_Component_Dialog();
    this.import_component_dialog = new Import_Component_Dialog();
    
    this.export_ability_dialog = new Export_Ability_Dialog();
    this.import_ability_dialog = new Import_Ability_Dialog();

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

    {
      const style = `
.vttes_overwrite_handout  {
  visibility: visible !important;
}

.vttes_export_handout {
  visibility: visible !important;
}

`;
      const el = createCSSElement(style, SHEET_ID);
      document.body.appendChild(el);
    }
  }

  dispose = () => {
    super.dispose();

    this.export_component_dialog.dispose();
    this.import_component_dialog.dispose();

    this.export_ability_dialog.dispose();
    this.import_ability_dialog.dispose();

    if(this.sheetTab) this.sheetTab.dispose();
    findByIdAndRemove(CharacterIOModule.journalWidgetId);

    window.r20es.export_handout = null;

    findByIdAndRemove(SHEET_ID);
  }
}

export default () => {
  new CharacterIOModule().install();
};

