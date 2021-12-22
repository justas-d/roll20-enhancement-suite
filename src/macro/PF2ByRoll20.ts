import {
    IMacroGenerator,
    IMacroFactory, IGeneratedMacro
} from '../modules/MacroGenerator/IMacroGenerator'
import lexCompare from "../utils/LexicographicalComparator";
import {Optional} from "../utils/TypescriptUtils";
import { create } from 'underscore';

interface RepeatingDataSet {
    group: string;
    name: string;
    macro: (idx: number) => string;
    hasMultiAttacks: boolean;
}

let dataSet: {[id: string]: RepeatingDataSet} = {
	"NPC Melee Attacks": {
		group: "repeating_melee-strikes",
		name: "weapon",
		macro: idx => `selected|repeating_melee-strikes_$${idx}_ATTACK-DAMAGE-NPC`,
		hasMultiAttacks: true,
	},

	"NPC Ranged Attacks": {
		group: "repeating_ranged-strikes",
		name: "weapon",
		macro: idx => `selected|repeating_ranged-strikes_$${idx}_ATTACK-DAMAGE-NPC`,
	    hasMultiAttacks: true,
	},

	"Player Melee Attacks": {
		group: "repeating_melee-strikes",
		name: "weapon",
		macro: idx => `selected|repeating_melee-strikes_$${idx}_ATTACK-DAMAGE`,
		hasMultiAttacks: true,
	},
		
	"Player Ranged Attacks": {
		group: "repeating_ranged-strikes",
		name: "weapon",
		macro: idx => `selected|repeating_ranged-strikes_$${idx}_ATTACK-DAMAGE`,
	    hasMultiAttacks: true,
	},

	"Innate Spells": {
		group: "repeating_spellinnate",
		name: "name",
		macro: idx => `selected|repeating_spellinnate_$${idx}_spellroll`,
		hasMultiAttacks: false,
	},

	"Focus Spells": {
		group: "repeating_spellfocus",
		name: "name",
		macro: idx => `selected|repeating_spellfocus_$${idx}_spellroll`,
		hasMultiAttacks: false,
	},

	"Cantrip Spells": {
		group: "repeating_cantrip",
		name: "name",
		macro: idx => `selected|repeating_cantrip_$${idx}_spellroll`,
		hasMultiAttacks: false,
	},

	"Normal Spells": {
		group: "repeating_normalspells",
		name: "name",
		macro: idx => `selected|repeating_normalspells_$${idx}_spellroll`,
		hasMultiAttacks: false,
	},
};

const tryGetRepeatingName = (character: Roll20.Character, group: string, abilityId: string, nameSuffix: string): Optional<string> => {
    const query = `${group}_${abilityId}_${nameSuffix}`;
    const name = character.attribs.models.find(a => a.get("name") === query);

    if (!name) {
        console.error("[Bulk macro generator for Pathfinder 2e R20] Could not find name for repeating section.");
        console.table({
            "Query": query,
            "Group name": group,
            "Name Attribute Name": nameSuffix,
            "Character name": character.get("name"),
            "Character UUID": character.get("id")
        });

        return;
    }

    return name.attributes.current;
};

const getAbilityIdsOfGroup = (character: Roll20.Character, group: string) => {
    let table = {};

    // create a sorted table so that we can create abilities that reference actions by index.
    character.attribs.models.forEach(a => {
        const name = a.get<string>("name");
        if (!name.startsWith(group + "_")) return;

        const words = name.split('_');
        if (words.length < 2) return;

        const id = words[2];
        table[id] = true;
    });

    return character.repeatingKeyOrder(Object.keys(table), group);
};

const generateMacroDataForRepeating = (char: Roll20.Character,
                                       group: string,
                                       nameAttrib: string,
                                       macroFactory: (idx: number) => string,
                                       hasMultiAttacks: boolean,
                                       createRawMacro: boolean, ) => {

    const ids = getAbilityIdsOfGroup(char, group);

    // we've got the ordered table, now make the macros.
    const orderedNames = [];
    for (let idIdx = 0; idIdx < ids.length; idIdx++) {
        const id = ids[idIdx];

        let currentName = tryGetRepeatingName(char, group, id, nameAttrib) || "";

        let macroGenerator = (atkIdx: number) => {
            let result = macroFactory(idIdx)

            if(atkIdx != 1){ // first attack action does not have numerical suffix, so take plain name
                result = `${result}${atkIdx}`
            }

            if(!createRawMacro) {
                result = `%{${result}}`
            }

            return result
        };

        orderedNames.push({
            name: currentName,
            macro: macroGenerator(1),
        });

        // we know that the PF2 sheet of roll2 uses identical macro names with suffixed attack index for 2nd and 3rd attack
        if(hasMultiAttacks) {
            orderedNames.push(
                { name: currentName+"#2", macro: macroGenerator(2) },
                { name: currentName+"#3", macro: macroGenerator(3) },
            )
        }
    }

    return orderedNames;
};

let macroFactories: IMacroFactory[] = [];

// add repeating sections
for (let name in dataSet) {
    const data = dataSet[name];

    let folderGenerator = (char: Roll20.Character) => {
        const macros = generateMacroDataForRepeating(char, data.group, data.name, data.macro, data.hasMultiAttacks, true);
        macros.sort((a, b) => lexCompare(a, b, (d: IGeneratedMacro) => d.name));

        let retval: string[] = [];

        let prevName = ""
        for(const macro of macros) {
            if (retval.length>0 && (macro.name === prevName+"#2" || macro.name === prevName+"#3")) {
                let atkSuffix = macro.name.slice(-2) // name is at least 2 chars long, else check above would have failed

                // add entries with shortened names to previous lines to have all associated attacks in the same line
                retval[retval.length-1] = retval[retval.length-1] + ` [${atkSuffix}](~${macro.macro})`
            } else {
                retval.push(`[${macro.name}](~${macro.macro})`)
                prevName = macro.name
            }
        }

        return retval;
    };

    macroFactories.push({
        name: name,
        create: char => generateMacroDataForRepeating(char, data.group, data.name, data.macro, data.hasMultiAttacks, false),
        createFolderEntries: folderGenerator,
    })
}

const id = "Pathfinder 2e by Roll20";

const PF2ByRoll20: IMacroGenerator = {
    id: id,
    name: id,
    macroFactories: macroFactories,
};

export default PF2ByRoll20;
