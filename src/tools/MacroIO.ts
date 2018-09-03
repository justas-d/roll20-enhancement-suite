import { Player, MacroAttributes } from "roll20";
import { IResult, Ok, Err } from "./Result";
import { R20 } from "./R20";

interface IParseStrategy {
    parse: (data: any) => IResult<IApplyableMacroData[], string>;
}

interface DataV1 {
    schema_version: number;
    macrobar: string;
    macros: MacroAttributes[];
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

const makeApplyableMacro = (macro: MacroAttributes, macrobarData: string[][]): IApplyableMacroData => {
    const macrobarIndex = macrobarData.findIndex(arr => arr.length >= 2 && arr[1] === macro.id);
    console.log(macro);

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
    export const wipeMacros = (player: Player): void => {
        R20.wipeObjectStorage(player.macros);
        player.save({
            macrobar: ""
        });
    }

    const strategies: { [id: number]: IParseStrategy } = {
        1: new ParseV1(),
        2: new ParseV2()
    }

    export const prepareMacroList = (player: Player): IApplyableMacroData[] => {
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
        let data: any;
        try {
            data = JSON.parse(rawData);
        } catch (err) {
            return new Err(err);
        }

        if (!("schema_version" in data)) return new Err("schema_version property not found in JSON data.");

        const ver = data.schema_version;

        if (!(ver in strategies)) return new Err(`schema_version ${ver} doesn't have a parse strategy.`);
        const strategy = strategies[ver];
        return strategy.parse(data);
    }

    export const applyToPlayer = (player: Player, macros: IApplyableMacroData[]) => {
        const macrobarRows = player.attributes.macrobar.split(',');

        for (const macroData of macros) {
            const macro = player.macros.create(macroData.attributes);

            if (macroData.macrobar) {

                let macrobar = `${player.id}|${macro.id}`;

                const hasCol = macroData.macrobar.color !== null;
                const hasName = macroData.macrobar.name !== null;

                console.log(macroData.macrobar);

                if (hasCol || hasName) {

                    if(hasCol && hasName) {
                        macrobar += `|${macroData.macrobar.color}|${macroData.macrobar.name}`
                    } else if (!hasCol) {
                        if (hasName) macrobar += `|#|${macroData.macrobar.name}`
                    } else {
                        if (!hasName) macrobar += `|${macroData.macrobar.color}`
                    }
                }

                macrobarRows.push(macrobar);
            }
        }

        console.log(macrobarRows);

        player.save({
            macrobar: macrobarRows.join(',')
        });
    }
}

export { MacroIO, ISlimMacroAttributes, IApplyableMacroData}
