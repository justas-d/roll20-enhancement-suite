import {ITool} from "../ITool";
import {DOM} from "../../utils/DOM";
import {R20} from "../../utils/R20";

interface IConfigurableAttribute {
  label: string;
  attribute_name: string;
  value_display_map: Record<string, string>;
}

const ALL_ATTRIB_DATAS: Array<IConfigurableAttribute> = [
  {
    label: "Advantage Roll Queries",
    attribute_name: "rtype",
    value_display_map: {
      "{{always=1}} {{r2=[[@{d20}": "Always Roll Advantage",
      "@{advantagetoggle}": "Advantage Toggle",
      "@{queryadvantage}": "Query Advantage",
      "{{normal=1}} {{r2=[[0d20": "Never Roll Advantage",
    }
  },

  {
    label: "Whisper Rolls To GM",
    attribute_name: "wtype",
    value_display_map: {
      "": "Never Whisper Rolls",
      "@{whispertoggle}": "Whisper Toggle",
      "?{Whisper?|Public Roll,|Whisper Roll,/w gm }": "Query Whisper",
      "/w gm ": "Always Whisper Rolls"
    }
  }
];

const onSetForAll = (e: Event) => {
  e.stopPropagation();

  const target = e.target as HTMLButtonElement;
  target.disabled = true;

  try {
    const attrib_name = target.getAttribute("data-key");
    if(!attrib_name) {
      alert("Could not find attribute name.");
      return;
    }

    const attrib_data = ALL_ATTRIB_DATAS.find(a => a.attribute_name === attrib_name);
    if(!attrib_data) {
      alert("Could not find attribute.");
      return;
    }

    const select_element = $(target.parentNode).find("select")[0] as HTMLSelectElement;
    if(!select_element) {
      alert("Could not find select element.");
      return;
    }

    const select_value = select_element.value;

    const chars = R20.getAllCharacters();

    const mod = { current: select_value };

    for(const char of chars) {
      let attrib: Roll20.CharacterSheetAttribute | null = null;

      for(const temp_attrib of char.attribs.models) {

        if(temp_attrib.attributes.name !== attrib_data.attribute_name) {
          continue;
        }

        attrib = temp_attrib;
        break;
      }

      if(!attrib) {
        attrib = char.attribs.create({
          name: attrib_data.attribute_name
        });
      }
      
      attrib.save(mod);
    }
  } 
  catch(err) {
    console.error(err);
    alert(`Error: ${err}`);
  } 
  finally {
    target.disabled = false;
    target.innerText = `Set for all (done!)`;
  }
};

const generateSelect = (cfg: IConfigurableAttribute) => {
  const options = [];

  for (const key in cfg.value_display_map) {
    options.push(<option value={key}>{cfg.value_display_map[key]}</option>);
  }

  return (
    <div style={{display: "grid", gridTemplateColumns: "2fr 3fr 1fr"}}>
      <span>{cfg.label}</span>

      <select>
        {options}
      </select>

      <button data-key={cfg.attribute_name} onClick={onSetForAll} className="btn">Set for all</button>
    </div>
  )
};

export class SheetRollTypeSetter implements ITool {
  public show(): HTMLElement {
    return (
      <div>
        {ALL_ATTRIB_DATAS.map(generateSelect)}
      </div>
    );
  }
}
