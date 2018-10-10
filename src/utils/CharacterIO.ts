import {replaceAll} from "./MiscUtils";
import {R20} from "./R20";
import {Character, CharacterBlobs, CharacterAttributes} from "roll20";

import {IResult, Err, Ok} from './Result'
import promiseWait from "./promiseWait";

interface IOverwriteStrategy {
    overwrite: (pc: Character, data: any) => IResult<boolean, string>;
}

class OverwriteV1 implements IOverwriteStrategy {
    overwrite = (pc: Character, data: any): IResult<boolean, string> => {

        const hasNot = what => !(what in data);

        if (hasNot("name")) return new Err("name not found");
        if (hasNot("avatar")) return new Err("avatar not found");
        if (hasNot("bio")) return new Err("bio not found");
        if (hasNot("attribs")) return new Err("attribs not found");

        let idx = 0;
        for (let el of data.attribs) {
            if (!("name" in el)) return new Err(`Attribute index ${idx} doesn't have name`);
            if (!("current" in el)) return new Err(`Attribute index ${idx} doesn't have current`);
            if (!("max" in el)) return new Err(`Attribute index ${idx} doesn't have max`);
        }

        CharacterIO.wipeCharacter(pc);

        pc.save({
            name: data.name,
            avatar: data.avatar,

        });

        pc.updateBlobs({bio: data.bio});

        for (let importAttrib of data.attribs) {
            pc.attribs.create(importAttrib);
        }

        pc.view.render();
        pc.save();

        return new Ok(true);
    }
}

class OverwriteV2 implements IOverwriteStrategy {

    overwrite = (pc: Character, data: any): IResult<boolean, string> => {

        const hasNot = what => !(what in data);

        if (hasNot("oldId")) return new Err("oldId not found");
        if (hasNot("name")) return new Err("name not found");
        if (hasNot("avatar")) return new Err("avatar not found");
        if (hasNot("bio")) return new Err("bio not found");
        if (hasNot("gmnotes")) return new Err("gmnotes not found");
        if (hasNot("defaulttoken")) return new Err("defaulttoken not found");
        if (hasNot("tags")) return new Err("tags not found");
        if (hasNot("controlledby")) return new Err("controlledby not found");
        if (hasNot("inplayerjournals")) return new Err("inplayerjournals not found");
        if (hasNot("attribs")) return new Err("attribs not found");
        if (hasNot("abilities")) return new Err("abilities not found");

        let idx = 0;
        for (let el of data.attribs) {
            if (!("name" in el)) return new Err(`Attribute index ${idx} doesn't have name`);
            if (!("current" in el)) return new Err(`Attribute index ${idx} doesn't have current`);
            if (!("max" in el)) return new Err(`Attribute index ${idx} doesn't have max`);
            if (!("id" in el)) return new Err(`Attribute index ${idx} doesn't have id`);
            idx++;
        }

        idx = 0;
        for (let el of data.abilities) {
            if (!("name" in el)) return new Err(`Ability index ${idx} doesn't have name`);
            if (!("description" in el)) return new Err(`Ability index ${idx} doesn't have description`);
            if (!("istokenaction" in el)) return new Err(`Ability index ${idx} doesn't have istokenaction`);
            if (!("action" in el)) return new Err(`Ability index ${idx} doesn't have action`);
            if (!("order" in el)) return new Err(`Ability index ${idx} doesn't have order`);
            idx++;
        }

        CharacterIO.wipeCharacter(pc);

        // some attributes store the id of the exported character
        // we replace them here with the new id 
        let jsonData = JSON.stringify(data);
        jsonData = replaceAll(jsonData, data.oldId, pc.attributes.id);
        data = JSON.parse(jsonData);

        // replace represents id
        const hasToken = data.defaulttoken && data.defaulttoken.length > 0;
        if (hasToken) {
            data.defaulttoken = replaceAll(data.defaulttoken, data.oldId, pc.attributes.id);
        }

        let save: any = {
            name: data.name,
            avatar: data.avatar,
            tags: data.tags,
            controlledby: data.controlledby,
            inplayerjournals: data.inplayerjournals,
            defaulttoken: ""
        };

        {
            let blobs: CharacterBlobs = {
                bio: data.bio,
            };

            if (R20.isGM()) {
                blobs.gmnotes = data.gmnotes
            }

            if (hasToken) {
                blobs.defaulttoken = data.defaulttoken;
                save.defaulttoken = (new Date).getTime();
            } else {
                blobs.defaulttoken = null;
                save.defaulttoken = "";
            }

            pc.updateBlobs(blobs);
        }


        for (let importAttrib of data.attribs) {
            pc.attribs.create(importAttrib);
        }

        for (let abil of data.abilities) {
            pc.abilities.create(abil);
        }

        pc.save(save);
        pc.view.render();

        return new Ok(true);
    }
}

namespace CharacterIO {

    export const formatVersions: { [id: number]: IOverwriteStrategy } = {
        1: new OverwriteV1(),
        2: new OverwriteV2()
    };

    export const exportSheet = (sheet, doneCallback) => {

        const blobPromise = new Promise(ok => sheet._getLatestBlob("defaulttoken", () => {console.log("IN CALLBA CK"); ok(false);}));
        const waitPromise = promiseWait(3000, true);

        Promise.race([blobPromise, waitPromise])
            .then(didTimeout => {
                console.log(sheet._blobcache.defaulttoken);

                let data = {
                    schema_version: 2,
                    oldId: sheet.attributes.id || "",
                    name: sheet.attributes.name || "",
                    avatar: sheet.attributes.avatar || "",
                    bio: sheet._blobcache.bio || "",
                    gmnotes: sheet._blobcache.gmnotes || "",
                    defaulttoken: sheet._blobcache.defaulttoken || "",
                    tags: sheet.attributes.tags || "",
                    controlledby: sheet.attributes.controlledby || "",
                    inplayerjournals: sheet.attributes.inplayerjournals || "",
                    attribs: [],
                    abilities: []
                };

                for (let attrib of sheet.attribs.models) {
                    data.attribs.push({
                        name: attrib.attributes.name,
                        current: attrib.attributes.current,
                        max: attrib.attributes.max,
                        id: attrib.attributes.id,
                    });
                }

                for (let abil of sheet.abilities.models) {
                    data.abilities.push({
                        name: abil.attributes.name,
                        description: abil.attributes.description,
                        istokenaction: abil.attributes.istokenaction,
                        action: abil.attributes.action,
                        order: abil.attributes.order
                    });
                }

                doneCallback(data);
            });
    };

    export const wipeCharacter = (pc: Character) => {
        R20.wipeObjectStorage(pc.abilities);
        R20.wipeObjectStorage(pc.attribs);

        {
            const blob: CharacterBlobs = {
                defaulttoken: null,
                bio: null
            };

            if (R20.isGM()) {
                blob.gmnotes = null;
            }

            pc.updateBlobs(blob);
        }

        pc.save({
            name: "",
            avatar: "",
            tags: "",
            controlledby: "",
            inplayerjournals: "",
            defaulttoken: "",
            bio: "",
            gmnotes: "",
            archived: false,
            attrorder: "",
            abilorder: "",
            mancerdata: "",
            mancerget: "",
            mancerstep: "",
        });
    }
}

export {CharacterIO, IOverwriteStrategy};
