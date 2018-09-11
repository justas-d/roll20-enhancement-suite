import {Err, IResult, Ok} from "./Result";
import IOCommon from "./IOCommon";
import {MapAttributes, TokenAttributes, TextTokenAttributes, PathTokenAttributes, Map, ObjectStorage, SyncObject} from "roll20";

interface DataV1 {
    schema_version: number;
    maps: IApplyableMapData[];
}

interface IApplyableMapData {
    attributes: MapAttributes;
    graphics: TokenAttributes[];
    text: TextTokenAttributes[];
    paths: PathTokenAttributes[];
}

interface IParseStrategy {
    parse: (data: any) => IResult<IApplyableMapData[], string>;
}

class ParseV1 {
    public parse = (data: any): IResult<IApplyableMapData[], string> => {
        if (!("maps" in data)) return new Err("maps not found in data");

        data.maps.forEach((m ,idx) => {
            if (!("attributes" in m)) return new Err(`attributes not found in map at index ${idx}`);
            if (!("graphics" in m)) return new Err(`graphics not found in map at index ${idx}`);
            if (!("text" in m)) return new Err(`text not found in map at index ${idx}`);
            if (!("paths" in m)) return new Err(`paths not found in map at index ${idx}`);
        });

        const shapedData: DataV1 = data;

        return new Ok(shapedData.maps);
    }
}

namespace MapIO {

    const strategies: {[id: number]: IParseStrategy} = {
        1: new ParseV1()
    };

    export const prepareMapData = (rawMaps: Map[]): IApplyableMapData[] => {
        return rawMaps.map(map => {
            return {
                attributes: map.attributes,
                graphics: map.thegraphics.map(g => g.attributes),
                text: map.thetexts.map(t => t.attributes),
                paths: map.thepaths.map(p => p.attributes),
            };
        });
    }

    export const serialize = (maps: IApplyableMapData[]): string => {
        const payload: DataV1 = {
            schema_version: 1,
            maps
        };

        return JSON.stringify(payload, null, 4);
    };

    export const deserialize = (rawData: string): IResult<IApplyableMapData[], string> => {
        const dataResult = IOCommon.parseRaw(rawData);
        if(dataResult.isErr()) return dataResult.map();
        const data = dataResult.ok().unwrap();

        const stratLookup = IOCommon.lookupStrategy(data, strategies);
        if(stratLookup.isErr()) return stratLookup.map();

        return stratLookup.ok().unwrap().parse(data);
    };

    const addSubstorage = <TData extends SyncObject<TAttrib>, TAttrib>(sourceSet: TAttrib[], target: ObjectStorage<TData>) => {
        sourceSet.forEach(data => target.create(data));
    };

    export const applyToCampaign = (mapDatas: IApplyableMapData[]) => {
        mapDatas.forEach(mapData => {
            const map = window.d20.Campaign.pages.create(mapData.attributes);
            addSubstorage(mapData.graphics, map.thegraphics);
            addSubstorage(mapData.paths, map.thepaths);
            addSubstorage(mapData.text, map.thetexts);
        });
    }
}

export { MapIO, IApplyableMapData }