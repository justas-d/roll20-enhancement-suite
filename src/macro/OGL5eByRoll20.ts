import {
    IMacroGenerator,
    IMacroFactory, IGeneratedMacro
} from '../modules/MacroGenerator/IMacroGenerator'
import { Character } from 'roll20';
import lexCompare from "../utils/LexicographicalComparator";

let dataSet = {
    "NPC Actions": {
        group: "repeating_npcaction",
        name: "name",
        macro: idx => `selected|repeating_npcaction_$${idx}_npc_action`,
        canMakeFolder: true,
    },

    "NPC Legendary Actions": {
        group: "repeating_npcaction-l",
        name: "name",
        macro: idx => `selected|repeating_npcaction-l_$${idx}_npc_action`,
        canMakeFolder: true,
    },

    "NPC Traits": {
        group: "repeating_npctrait",
        name: "name",
        macro: idx => `@{selected|wtype}&{template:npcaction} {{name=@{selected|npc_name}}} {{rname=@{selected|repeating_npctrait_$${idx}_name}}} {{description=@{selected|repeating_npctrait_$${idx}_desc}}}`,
        canMakeFolder: false,
    },

    "NPC Reactions": {
        group: "repeating_npcreaction",
        name: "name",
        macro: idx => `@{selected|wtype}&{template:npcaction} {{name=@{selected|npc_name}}} {{rname=@{selected|repeating_npcreaction_$${idx}_name}}} {{description=@{selected|repeating_npcreaction_$${idx}_desc}}}`,
        nameMod: name => "Reaction:" + name,
        canMakeFolder: false,
    },

    "Player Attacks": {
        group: "repeating_attack",
        name: "atkname",
        macro: idx => `selected|repeating_attack_$${idx}_attack`,
        canMakeFolder: true,
    },

    "Player Tools": {
        group: "repeating_tool",
        name: "toolname",
        macro: idx => `selected|repeating_tool_$${idx}_tool`,
        canMakeFolder: true,
    },

    "Player Traits": {
        group: "repeating_traits",
        name: "name",
        macro: idx => `@{selected|wtype}&{template:traits} @{selected|charname_output} {{name=@{selected|repeating_traits_$${idx}_name}}} {{source=@{selected|repeating_traits_$${idx}_source}: @{selected|repeating_traits_$${idx}_source_type}}} {{description=@{selected|repeating_traits_$${idx}_description}}}`,
        canMakeFolder: false,
    },

    "Spellbook Cantrips": {
        group: "repeating_spell-cantrip",
        name: "spellname",
        macro: idx => `selected|repeating_spell-cantrip_$${idx}_spell`,
        canMakeFolder: true,
    }
};

for (let lvl = 1; lvl <= 9; lvl++) {
    dataSet[`Spellbook Level ${lvl}`] = {
        group: `repeating_spell-${lvl}`,
        name: "spellname",
        macro: idx => `selected|repeating_spell-${lvl}_$${idx}_spell`,
        canMakeFolder: true,
        categoryMod: (name, idx) => `${name} (@{Selected|lvl${lvl}_slots_expended}/@{Selected|lvl${lvl}_slots_total})`,
    }
}

const generateMacroData = (char: Character,
                           group: string,
                           nameAttrib: string,
                           macroFactory: (idx: number) => string,
                           nameMod?: (name: string) => string) => {
    let table = {};

    // create a sorted table so that we can create abilities that reference actions by index.
    char.attribs.models.forEach(a => {
        const name = a.get<string>("name");
        if (!name.startsWith(group + "_")) return;

        const words = name.split('_');
        if (words.length < 2) return;

        const id = words[2];
        table[id] = true;
    });

    const ids = char.repeatingKeyOrder(Object.keys(table), group);

    // we've got the ordered table, now make the macros.
    const orderedNames = [];
    for (let idIdx = 0; idIdx < ids.length; idIdx++) {
        const id = ids[idIdx];
        const query = `${group}_${id}_${nameAttrib}`;
        const name = char.attribs.models.find(a => a.get("name") === query);

        if (!name) {
            console.error("[Bulk macro generator for 5e OGL R20] Could not find name for repeating section.");
            console.table({
                "Query": query,
                "Group name": group,
                "Name Attribute Name": nameAttrib,
                "Character name": char.get("name"),
                "Character UUID": char.get("id")
            });

            continue;
        }

        let finalName = name.get<string>("current");
        if(typeof(nameMod) === "function") {
            finalName = nameMod(finalName);
        }

        orderedNames.push({
            name: finalName,
            macro: macroFactory(idIdx)
        });
    }

    return orderedNames;
};

let macroFactories: IMacroFactory[] = [];

for (let name in dataSet) {

    const data = dataSet[name];

    let folderGenerator = undefined;

    if(data.canMakeFolder) {
        folderGenerator = (char: Character) => {

            const macros = generateMacroData(char, data.group, data.name, data.macro, data.nameMod);
            macros.sort((a, b) => lexCompare(a, b, (d: IGeneratedMacro) => d.name));

            let retval: string[] = [];

            for(const macro of macros) {
                retval.push(`[${macro.name}](~${macro.macro})`);
            }

            return retval;
        };
    }

    const normalMacro = data.canMakeFolder
        ? (idx) => `%{${data.macro(idx)}}`
        : data.macro;

    macroFactories.push({
        name: name,
        create: char => generateMacroData(char, data.group, data.name, normalMacro, data.nameMod),
        createFolderEntries: folderGenerator,
        categoryNameModifier: data.categoryMod
    })
}

const id = "D&D 5e OGL by Roll20";

const OGL5eByRoll20: IMacroGenerator = {
    id: id,
    name: id,
    macroFactories: macroFactories,
};

export default OGL5eByRoll20;
