import { MacroAttributes, Player } from "roll20";
import { IResult, Ok, Err } from "./Result";
import { R20 } from "./R20";
import { replaceAll } from "./MiscUtils";

interface IOverwriteStrategy {
    overwrite: (player: Player, data: any) => IResult<boolean, string>;
}

interface DataV1 {
    schema_version: number;
    macrobar: string;
    macros: MacroAttributes[];
    playerId: string;
}

class OverwriteV1 implements IOverwriteStrategy {
    overwrite = (player: Player, data: any): IResult<boolean, string> => {
        if (!player) return new Err(`player is ${player}`);
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
    
        
        MacroIO.wipeMacros(player);

        const shapedData: DataV1 = data;

        shapedData.macrobar = replaceAll(shapedData.macrobar, shapedData.playerId, player.id);
    
        for (let i = 0; i < shapedData.macros.length; i++) {
            const macro = shapedData.macros[i];
            const newMacro = player.macros.create(macro);

            shapedData.macrobar = replaceAll(shapedData.macrobar, macro.id, newMacro.id);
        }
    
        player.save({
            macrobar: shapedData.macrobar
        });
    
        return new Ok(true);
    }
}

namespace MacroIO {
    export const wipeMacros = (player: Player): void => {
        R20.wipeObjectStorage(player.macros);
        player.save({
            macrobar: ""
        });
    }

    const strategies: {[id: number]: IOverwriteStrategy} = {
        1: new OverwriteV1()
    }

    export const serialize = (player: Player): IResult<string, string> => {
        
        const macros = player.macros.models.map(m => {
            return {
                id: m.attributes.id,
                action: m.attributes.action,
                istokenaction: m.attributes.istokenaction,
                name: m.attributes.name,
                visibleto: m.attributes.visibleto
            }
        });

        const payload: DataV1 = {
            schema_version: 1,
            macrobar: player.attributes.macrobar,
            playerId: player.id,
            macros
        };
    
        return new Ok(JSON.stringify(payload, null, 4));
    }

    export const importData = (player: Player, rawData: string): IResult<boolean, string> => {
        let data: any;
        try {
            data = JSON.parse(rawData);
        } catch (err) {
            return new Err(err);
        }

        if (!("schema_version" in data)) return new Err("schema_version property not found in JSON data.");

        const ver = data.schema_version;

        if (!(ver in strategies)) return new Err(`schema_version ${ver} doesn't have a parse strategy.`);

        return strategies[ver].overwrite(player, data);
    }
}

export { MacroIO }

