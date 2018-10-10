import {IResult, Err, Ok} from "./Result";

namespace IOCommon {

    export const parseRaw = (rawData: string): IResult<any, string> => {
        let data: any;
        try {
            data = JSON.parse(rawData);
        } catch (err) {
            return new Err(err);
        }
        return new Ok(data);
    };

    export const lookupStrategy = <T>(data: any, strategies: {[id: number]: T}): IResult<T, string> => {
        if (!("schema_version" in data)) return new Err("schema_version property not found in JSON data.");

        const ver = data.schema_version;

        if (!(ver in strategies)) return new Err(`schema_version ${ver} doesn't have a parse strategy.`);
        return new Ok(strategies[ver]);
    }
}

export default IOCommon;