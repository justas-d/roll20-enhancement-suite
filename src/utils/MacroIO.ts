import { IResult, Ok, Err } from "./Result";
import { R20 } from "./R20";
import IOCommon from "./IOCommon";
import {ImportStrategy} from "../modules/ImportStrategy";

interface IParseStrategy {
    parse: (data: any) => IResult<IApplyableMacroData[], string>;
}

interface DataV1 {
    schema_version: number;
    macrobar: string;
    macros: Roll20.MacroAttributes[];
    playerId: string;
}

interface DataV2 {
    schema_version: number;
    macros: IApplyableMacroData[];
}

interface ISlimMacroAttributes {
    action: string;
    istokenaction: boolean;
    name: string;
    visibleto: string;
}

interface IMacrobarData {
    color: string;
    name: string;
}

interface IApplyableMacroData {
    attributes: ISlimMacroAttributes;
    macrobar?: IMacrobarData;
}

class ParseV2 implements IParseStrategy {
    parse = (data: any): IResult<IApplyableMacroData[], string> => {
        if (!("macros" in data)) return new Err("macros list not found in data");

        for (let i = 0; i < data.macros.length; i++) {
            const macro = data.macros[i];
            if(!macro) return new Err(`macro ${i}is an invalid value: ${macro}`);
            if (!("attributes" in macro)) return new Err(`attributes not found in macro ${i}`);

            if(macro.macrobar) {
                if (!("name" in macro.macrobar)) return new Err(`name not found in macro.macrobar ${i}`);
                if (!("color" in macro.macrobar)) return new Err(`color not found in macro.macrobar ${i}`);
            }

            if (!("action" in macro.attributes)) return new Err(`action not found in macro.attributes ${i}`);
            if (!("istokenaction" in macro.attributes)) return new Err(`istokenaction not found in macro.attributes ${i}`);
            if (!("name" in macro.attributes)) return new Err(`name not found in macro.attributes ${i}`);
            if (!("visibleto" in macro.attributes)) return new Err(`visibleto not found in macro.attributes ${i}`);
        }

        return new Ok(data.macros as IApplyableMacroData[]);
    }
}

class ParseV1 implements IParseStrategy {
    parse = (data: any): IResult<IApplyableMacroData[], string> => {
        if (!data) return new Err(`player is ${data}`);

        if (!("macrobar" in data)) return new Err("macrobar not found in data");
        if (!("playerId" in data)) return new Err("playerId not found in data");
        if (!("macros" in data)) return new Err("macros list not found in data");

        for (let i = 0; i < data.macros.length; i++) {
            const macro = data.macros[i];
            if (!macro) return new Err(`macro ${i}is an invalid value: ${macro}`);
            if (!("id" in macro)) return new Err(`id not found in macro ${i}`);
            if (!("action" in macro)) return new Err(`action not found in macro ${i}`);
            if (!("istokenaction" in macro)) return new Err(`istokenaction not found in macro ${i}`);
            if (!("name" in macro)) return new Err(`name not found in macro ${i}`);
            if (!("visibleto" in macro)) return new Err(`visibleto not found in macro ${i}`);
        }

        const shapedData: DataV1 = data as DataV1;
        const macrobarData = getUserMacrobarData(shapedData.macrobar);;
        const retval: IApplyableMacroData[] = [];

        for (const macro of shapedData.macros) {
            const macroPayload = makeApplyableMacro(macro, macrobarData);
            retval.push(macroPayload);
        }

        return new Ok(retval);
    }
}

//       user id  0          macro id  1        color  2    name 3
//-LLDzVWKvJl7qGUiF0m5|-LFqTKwDbqJQ3raPTwNI|#cc4125|%E2%9A%94%EF%B8%8F
const getUserMacrobarData = (rawMacroBar: string) => rawMacroBar.split(',').map(r => r.split('|'));

const makeApplyableMacro = (
  macro: Roll20.MacroAttributes, 
  macrobarData: string[][]
): IApplyableMacroData => {
    const macrobarIndex = macrobarData.findIndex(arr => arr.length >= 2 && arr[1] === macro.id);

    const retval: IApplyableMacroData = {
        attributes: {
            action: macro.action,
            istokenaction:  macro.istokenaction,
            name:  macro.name,
            visibleto:  macro.visibleto
        }
    };

    if (macrobarIndex !== -1) {
        const macrobarRow = macrobarData[macrobarIndex];
        retval.macrobar = {
            color: macrobarRow.length >= 3 ? macrobarRow[2] : null,
            name: macrobarRow.length >= 4 ? macrobarRow[3] : null,
        }
    }

    return retval;
}

namespace MacroIO {
    export const wipeMacros = (player: Roll20.Player): void => {
        R20.wipeObjectStorage(player.macros);
        player.save({
            macrobar: ""
        });
    }

    const strategies: { [id: number]: IParseStrategy } = {
        1: new ParseV1(),
        2: new ParseV2()
    }

    export const prepareMacroList = (player: Roll20.Player): IApplyableMacroData[] => {
        const macrobarData = getUserMacrobarData(player.attributes.macrobar);
        return player.macros.models.map(m => makeApplyableMacro(m.attributes, macrobarData));
    }

    export const serialize = (macros: IApplyableMacroData[]): string => {

        const payload: DataV2 = {
            schema_version: 2,
            macros,
        };

        return JSON.stringify(payload, null, 4);
    }

    export const deserialize = (rawData: string): IResult<IApplyableMacroData[], string> => {
        const dataResult = IOCommon.parseRaw(rawData);
        if(dataResult.isErr()) return dataResult.map();
        const data = dataResult.ok().unwrap();

        const stratLookup = IOCommon.lookupStrategy(data, strategies);
        if(stratLookup.isErr()) return stratLookup.map();

        return stratLookup.ok().unwrap().parse(data);
    }

    const createMacroBarEntry = (player: Roll20.Player, macroId: string, macroData: IApplyableMacroData) => {
        let macrobar = `${player.id}|${macroId}`;

        const hasCol = macroData.macrobar.color !== null;
        const hasName = macroData.macrobar.name !== null;

        if (hasCol || hasName) {

            if (hasCol && hasName) {
                macrobar += `|${macroData.macrobar.color}|${macroData.macrobar.name}`
            } else if (!hasCol) {
                if (hasName) {
                    macrobar += `|#|${macroData.macrobar.name}`
                }
            } else {
                if (!hasName) {
                    macrobar += `|${macroData.macrobar.color}`
                }
            }
        }
        return macrobar;
    }

    export const applyToPlayer = (
        player: Roll20.Player, 
        macros: IApplyableMacroData[], 
        strategy: ImportStrategy
    ) => {
        console.log(strategy);

        const currentMacros = player.macros
        const macrobarRows = player.attributes.macrobar.split(',');

        for (const macroData of macros) {
            let updateMatched = false;

            if (ImportStrategy.UPDATE_FIRST_MATCH === strategy) {
                const name = macroData.attributes.name;
                const matchingExistingMacro = currentMacros.find(macro => name === macro.attributes.name);

                if (matchingExistingMacro) {

                    //update the object
                    Object.assign(matchingExistingMacro.attributes, macroData.attributes);
                    matchingExistingMacro.save();

                    //update the macrobar
                    const existingRowIndex = macrobarRows.findIndex(bar => bar.includes(matchingExistingMacro.id));

                    //if it is not there, add it if the json has attributes
                    if (existingRowIndex === -1) {
                        if (macroData.macrobar) {
                            macrobarRows.push(createMacroBarEntry(player, matchingExistingMacro.id, macroData));
                        }
                    } else {
                        //if json has attributes, replace them, else, if it does not,r emove it
                        if (macroData.macrobar) {
                            macrobarRows[existingRowIndex] = createMacroBarEntry(player, matchingExistingMacro.id, macroData);
                        } else {
                            macrobarRows.splice(existingRowIndex, 1);
                        }
                    }
                    updateMatched = true;
                }
            }

            if (updateMatched === false) {
                const macro = player.macros.create(macroData.attributes);

                if (macroData.macrobar) {
                    macrobarRows.push(createMacroBarEntry(player, macro.id, macroData));
                }
            }
        }

        player.save({
            macrobar: macrobarRows.join(',')
        });
    }
}

export { MacroIO, ISlimMacroAttributes, IApplyableMacroData}
