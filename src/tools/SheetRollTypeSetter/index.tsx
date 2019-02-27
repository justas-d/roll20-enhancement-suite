import {ITool} from "../ITool";
import {DOM} from "../../utils/DOM";
import {R20} from "../../utils/R20";
import {CharacterSheetAttribute} from "roll20";

interface IConfigurableAttribute {
    label: string;
    attributeName: string;
    valueDisplayMap: { [value: string]: string };
}

const attribs = [
    {
        label: "Advantage Roll Queries",
        attributeName: "rtype",
        valueDisplayMap: {
            "{{always=1}} {{r2=[[@{d20}": "Always Roll Advantage",
            "@{advantagetoggle}": "Advantage Toggle",
            "{{query=1}} ?{Advantage?|Normal Roll,&#123&#123normal=1&#125&#125 &#123&#123r2=[[0d20|Advantage,&#123&#123advantage=1&#125&#125 &#123&#123r2=[[@{d20}|Disadvantage,&#123&#123disadvantage=1&#125&#125 &#123&#123r2=[[@{d20}}": "Query Advantage",
            "{{normal=1}} {{r2=[[0d20": "Never Roll Advantage",
        }
    },

    {
        label: "Whisper Rolls To GM",
        attributeName: "wtype",
        valueDisplayMap: {
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

        const attribName = target.getAttribute("data-key");
        if (!attribName) {
            alert("Could not find attribute name.");
            return;
        }

        const attribData = attribs.find(a => a.attributeName === attribName);
        if (!attribData) {
            alert("Could not find attribute.");
            return;
        }

        const selectElement = $(target.parentNode).find("select")[0] as HTMLSelectElement;
        if (!selectElement) {
            alert("Could not find select element.");
            return;
        }
        const selectValue = selectElement.value;

        const chars = R20.getAllCharacters();

        const mod = {
            current: selectValue
        };

        for (const char of chars) {

            let attrib: CharacterSheetAttribute | null = null;
            for (const tempAttrib of char.attribs.models) {
                if (tempAttrib.attributes.name !== attribData.attributeName) continue;
                attrib = tempAttrib;
                break;
            }

            if (!attrib) {
                attrib = char.attribs.create({
                    name: attribData.attributeName
                });
            }
            
            attrib.save(mod);
        }

    } catch(err) {
        console.error(err);
        alert(`Error: ${err}`);
    } finally {
        target.disabled =false;
        target.innerText = `${setForAllText} (done!)`;
    }
};

const setForAllText = "Set for all";

const generateSelect = (cfg: IConfigurableAttribute) => {
    const options = [];

    for (const key in cfg.valueDisplayMap) {
        options.push(<option value={key}>{cfg.valueDisplayMap[key]}</option>);
    }

    return (
        <div style={{display: "grid", gridTemplateColumns: "2fr 3fr 1fr"}}>
            <span>{cfg.label}</span>

            <select>
                {options}
            </select>

            <button data-key={cfg.attributeName} onClick={onSetForAll} className="btn btn-primary">{setForAllText}</button>
        </div>
    )
};

export class SheetRollTypeSetter implements ITool {
    public show(): HTMLElement {
        return (

            <div>
                {attribs.map(generateSelect)}
            </div>
        );
    }
}
