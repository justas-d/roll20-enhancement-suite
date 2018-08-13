import { replaceAll } from "./MiscUtils";
import { R20 } from "./R20";

let CharacterIO = {};

CharacterIO.exportSheet = function(sheet, doneCallback) {
    sheet._getLatestBlob("defaulttoken", dt => {
        let data = {
            schema_version: 2,
            oldId: sheet.attributes.id,
            name: sheet.attributes.name,
            avatar: sheet.attributes.avatar,
            bio: sheet._blobcache.bio,
            gmnotes: sheet._blobcache.gmnotes,
            defaulttoken: dt || "",
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
}

CharacterIO.formatVersions = {};

const fmtInvalid = msg => { return { isValid: false, reason: msg }; }

CharacterIO.formatVersions[1] = {
    isValidData: function (data) {

        let hasNot = what => !(what in data);

        if (hasNot("name")) return fmtInvalid("name not found");
        if (hasNot("avatar")) return fmtInvalid("avatar not found");
        if (hasNot("bio")) return fmtInvalid("bio not found");
        if (hasNot("attribs")) return fmtInvalid("attribs not found");

        let idx = 0;
        for (let el of data.attribs) {
            if (!("name" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have name`);
            if (!("current" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have current`);
            if (!("max" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have max`);
        }

        return { isValid: true };
    },

    overwrite: function (pc, data) {
        pc.save({
            name: data.name,
            avatar: data.avatar,

        });

        pc.updateBlobs({ bio: data.bio });
        pc.attribs.reset();

        for (let importAttrib of data.attribs) {
            pc.attribs.create(importAttrib);
        }

        pc.view.render();
        pc.save();

        console.log("Imported v1!");
    }
};

CharacterIO.formatVersions[2] = {
    isValidData: function (data) {

        let hasNot = what => !(what in data);

        if (hasNot("name")) return fmtInvalid("name not found");
        if (hasNot("oldId")) return fmtInvalid("oldId not found");
        if (hasNot("avatar")) return fmtInvalid("avatar not found");
        if (hasNot("bio")) return fmtInvalid("bio not found");
        if (hasNot("gmnotes")) return fmtInvalid("gmnotes not found");
        if (hasNot("attribs")) return fmtInvalid("attribs not found");
        if (hasNot("defaulttoken")) return fmtInvalid("attribs not found");

        let idx = 0;
        for (let el of data.attribs) {
            if (!("name" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have name`);
            if (!("current" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have current`);
            if (!("max" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have max`);
            if (!("id" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have id`);
        }

        idx = 0;
        for (let el of data.abilities) {
            if (!("name" in el)) return fmtInvalid(`Ability index ${idx} doesn't have name`);
            if (!("description" in el)) return fmtInvalid(`Ability index ${idx} doesn't have description`);
            if (!("istokenaction" in el)) return fmtInvalid(`Ability index ${idx} doesn't have istokenaction`);
            if (!("action" in el)) return fmtInvalid(`Ability index ${idx} doesn't have action`);
            if (!("order" in el)) return fmtInvalid(`Ability index ${idx} doesn't have order`);
        }

        return { isValid: true };
    },

    overwrite: function (pc, data) {

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

        let save = {
            name: data.name,
            avatar: data.avatar,
        };

        {
            let blobs = {};

            blobs.bio = data.bio;
            if(R20.isGM())
                blobs.gmnotes = data.gmnotes
            
            if(hasToken) {
                blobs.defaulttoken = data.defaulttoken;
                save.defaulttoken = (new Date).getTime();
            } else {
                blobs.defaulttoken = null;
                save.defaulttoken = "";
            }

            pc.updateBlobs(blobs);
        }

        {
            pc.attribs.reset();
            for (let importAttrib of data.attribs) {
                pc.attribs.create(importAttrib);
            }
        }

        {
            pc.abilities.reset();
            for (let abil of data.abilities) {
                pc.abilities.create(abil);
            }
        }

        pc.save(save);
        pc.view.render();

        console.log("Imported v2!");
    }
};

export {CharacterIO};
