import { MacroAttributes, Player } from "roll20";
import { IResult, Ok, Err } from "./Result";

let strategies: { [id: number]: (player: Player, data: any) => IResult<boolean, string> } = {};
strategies[1] = (player: Player, data: any): IResult<boolean, string> => {
    if(!player) return new Err(`player is ${player}`);
    if(!data) return new Err(`player is ${data}`);

    if (!("macrobar" in data)) return new Err("macrobar not found in data");
    if (!("macros" in data)) return new Err("macros list not found in data");

    interface IShaped {
        macrobar: string;
        macros: MacroAttributes[];
    }

    for (let i = 0; i < data.macros.length; i++) {
        const macro = data.macros[i];
        if(!macro) return new Err(`macro ${i}is an invalid value: ${macro}`);
        if (!("id" in macro)) return new Err(`id not found in macro ${i}`);
        if (!("action" in macro)) return new Err(`action not found in macro ${i}`);
        if (!("istokenaction" in macro)) return new Err(`istokenaction not found in macro ${i}`);
        if (!("name" in macro)) return new Err(`name not found in macro ${i}`);
        if (!("visibleto" in macro)) return new Err(`visibleto not found in macro ${i}`);
    }

    let shapedData: IShaped = data;
    
    player.macros.reset();

    for (let i = 0; i < shapedData.macros.length; i++) {
        const macro = shapedData.macros[i];
        player.macros.create(macro);
    }

    player.save({
        macrobar: shapedData.macrobar
    });

    return new Ok(true);
}


class MacroIO {

    static serialize(player: Player): IResult<string, string> {
        let payload: any = {};
        payload.schema_version = 1;
        payload.macrobar = player.attributes.macrobar;
        payload.macros = player.macros.models.map(m => {
            return {
                id: m.attributes.id,
                action: m.attributes.action,
                istokenaction: m.attributes.istokenaction,
                name: m.attributes.name,
                visibleto: m.attributes.visibleto
            }
        });

        return new Ok(JSON.stringify(payload, null, 4));
    }

    static import(player: Player, rawData: string): IResult<boolean, string> {
        let data: any;
        try {
            data = JSON.parse(rawData);
        } catch (err) {
            return new Err(err);
        }

        if (!("schema_version" in data)) return new Err("schema_version property not found in JSON data.");

        const ver = data.schema_version;
        
        if (!(ver in strategies)) return new Err(`schema_version ${ver} doesn't have a parse strategy.`);

        return strategies[ver](player, data);
    }
}

export { MacroIO }

