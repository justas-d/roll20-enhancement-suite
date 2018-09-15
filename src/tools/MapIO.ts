import {Err, IResult, Ok} from "./Result";
import IOCommon from "./IOCommon";
import {
    MapAttributes, TokenAttributes, TextTokenAttributes, PathTokenAttributes, Map, ObjectStorage, SyncObject,
    MapTokenAttributes,
    Character
} from "roll20";
import {strIsNullOrEmpty} from "./MiscUtils";
import {R20} from "./R20";
import * as Fuse from "fuse.js";

interface DataV1 {
    schema_version: number;
    maps: IApplyableMapData[];
}

interface ITokenLinkNames {
    character: string;
    bar2: string; // can be null
    bar3: string; // can be null
    bar1: string; // can be null
}

interface IRemapData {
    id: string;
    display: string;
}

type RemapTable = { [id: string]: IRemapData }; // value can be null

interface ITokenRemapTables {
    id: RemapTable;
    bar1: RemapTable;
    bar2: RemapTable;
    bar3: RemapTable;
}

interface IApplyableTokenAttributes {
    attribs: TokenAttributes;
    linkNames: ITokenLinkNames; // can be null
}

interface IApplyableMapData {
    attributes: MapAttributes;
    graphics: IApplyableTokenAttributes[];
    text: TextTokenAttributes[];
    paths: PathTokenAttributes[];
}

interface IParseStrategy {
    parse: (data: any) => IResult<IApplyableMapData[], string>;
}

class ParseV1 {
    public parse = (data: any): IResult<IApplyableMapData[], string> => {
        if (!("maps" in data)) return new Err("maps not found in data");

        data.maps.forEach((m, idx) => {
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

    const strategies: { [id: number]: IParseStrategy } = {
        1: new ParseV1()
    };

    export const prepareMapData = (rawMaps: Map[]): IApplyableMapData[] => {
        return rawMaps.map(map => {

            const graphics = map.thegraphics.map(g => {
                const makeNormal = () => {
                    return {attribs: g.attributes, linkNames: null}
                };

                if (strIsNullOrEmpty(g.attributes.represents)) return makeNormal();

                const character = R20.getCharacter(g.attributes.represents);
                if (!character) {
                    console.error(`represents attribute was set but the value didn't point to any character! Id: ${g.attributes.represents}`);
                    return makeNormal();
                }

                // Note(Justas): append a attribute name string to bar1/2/3 links
                // so that we can attempt to try relink tokens if the user
                // remaps them during importing

                const getBarName = (link) => {
                    if (strIsNullOrEmpty(link)) return null;
                    const attrib = character.attribs.get(link);
                    if (!attrib) return null;
                    return attrib.attributes.name;
                };

                return {
                    attribs: g.attributes,
                    linkNames: {
                        character: character.attributes.name,
                        bar1: getBarName(g.attributes.bar1_link),
                        bar2: getBarName(g.attributes.bar2_link),
                        bar3: getBarName(g.attributes.bar3_link),
                    }
                }
            });

            return {
                attributes: map.attributes,
                graphics,
                text: map.thetexts.map(t => t.attributes),
                paths: map.thepaths.map(p => p.attributes),
            };
        });
    };

    export const serialize = (maps: IApplyableMapData[]): string => {
        const payload: DataV1 = {
            schema_version: 1,
            maps
        };

        return JSON.stringify(payload, null, 4);
    };

    export const deserialize = (rawData: string): IResult<IApplyableMapData[], string> => {
        const dataResult = IOCommon.parseRaw(rawData);
        if (dataResult.isErr()) return dataResult.map();
        const data = dataResult.ok().unwrap();

        const stratLookup = IOCommon.lookupStrategy(data, strategies);
        if (stratLookup.isErr()) return stratLookup.map();

        return stratLookup.ok().unwrap().parse(data);
    };

    const addSubstorage =
        <TData extends SyncObject<TAttrib>, TAttrib extends MapTokenAttributes>
        (map: Map, sourceSet: TAttrib[], target: ObjectStorage<TData>) => {
            sourceSet.forEach(data => {
                const newVal = target.create(data);
                newVal.attributes.page_id = data.page_id;
            });
        };

    const remap = (table: { [tableId: string]: IRemapData }, id: string): string => {
        const newVal = table[id];
        if (newVal) return newVal.id;
        return id;
    };

    export const applyToCampaign = (mapDatas: IApplyableMapData[], remaps: ITokenRemapTables): void => {
        mapDatas.forEach(mapData => {
            const map = window.d20.Campaign.pages.create(mapData.attributes);

            for (const importToken of mapData.graphics) {
                const newToken = map.thegraphics.create(importToken.attribs);
                newToken.attributes.page_id = map.id;

                newToken.attributes.represents = remap(remaps.id, newToken.attributes.represents);
                newToken.attributes.bar1_link = remap(remaps.bar1, newToken.attributes.bar1_link);
                newToken.attributes.bar2_link = remap(remaps.bar2, newToken.attributes.bar2_link);
                newToken.attributes.bar3_link = remap(remaps.bar3, newToken.attributes.bar3_link);
            }

            addSubstorage(map, mapData.paths, map.thepaths);
            addSubstorage(map, mapData.text, map.thetexts);
        });
    }

    export const generateRemapTable = (mapDatas: IApplyableMapData[]): ITokenRemapTables => {
        const remap: ITokenRemapTables = {
            id: {}, bar1: {}, bar2: {}, bar3: {}
        };

        for (const map of mapDatas) {
            map.graphics.forEach(g => {
                if (!g.attribs.represents) return;
                if (g.attribs.represents in remap.id) return;

                // find char
                let char: Character = null;
                {
                    const tempChar = R20.getCharacter(g.attribs.represents);
                    if (tempChar && tempChar.attributes.name === g.linkNames.character) {
                        char = tempChar;
                        console.log("Found existing character");
                    } else {

                        // Note(Justas): use fuse to find the character with the name that best
                        // matches linkName.character

                        const options = {
                            keys: ["attributes.name"],
                            id: "id"
                        };

                        const fuse = new Fuse(R20.getAllCharacters(), options);
                        const matches: string[] = fuse.search(g.linkNames.character);
                        if (matches.length > 0) {
                            char = R20.getCharacter(matches[0]);
                        }
                    }
                }

                const setRemap = (table: RemapTable, val: IRemapData) => table[g.attribs.represents] = val;

                if (!char) {
                    console.log(`couldn't auto find any character for ${g.linkNames.character}`)
                    setRemap(remap.id, null);
                    setRemap(remap.bar1, null);
                    setRemap(remap.bar2, null);
                    setRemap(remap.bar3, null);
                    return;
                }

                setRemap(remap.id, {id: char.id, display: char.attributes.name});

                const tryRemapBar = (barName: string, table: RemapTable) => {
                    if (barName) {
                        const attrib = char.attribs.find(f => f.attributes.name === barName);
                        if (attrib) {
                            setRemap(table, {id: attrib.id, display: attrib.attributes.name});
                        }
                    }
                };

                tryRemapBar(g.linkNames.bar1, remap.bar1);
                tryRemapBar(g.linkNames.bar2, remap.bar2);
                tryRemapBar(g.linkNames.bar3, remap.bar3);
            });
        }

        return remap;
    }
}

export {MapIO, IApplyableMapData, ITokenRemapTables, RemapTable}