import {replaceAll} from "./MiscUtils";
import {R20} from "./R20";
import {Character, CharacterBlobs, CharacterAttributes} from "roll20";
import promiseWait from "./promiseWait";

interface IOverwriteStrategy {
    overwrite: (pc: Character, data: any) => Promise<any>
}

const get_default_save = (): any => {
  return {
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
  };
};

const get_default_blobs = () => {
  const blob: CharacterBlobs = {
    defaulttoken: null,
    bio: null
  };

  if (R20.isGM()) {
    blob.gmnotes = null;
  }

  return blob;
};

class OverwriteV1 implements IOverwriteStrategy {
  overwrite = (pc: Character, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log("Schema 1");

      const hasNot = what => !(what in data);

      if (hasNot("name")) return reject("name not found");
      if (hasNot("avatar")) return reject("avatar not found");
      if (hasNot("bio")) return reject("bio not found");
      if (hasNot("attribs")) return reject("attribs not found");

      let idx = 0;
      for (let el of data.attribs) {
        if (!("name" in el)) return reject(`Attribute index ${idx} doesn't have name`);
        if (!("current" in el)) return reject(`Attribute index ${idx} doesn't have current`);
        if (!("max" in el)) return reject(`Attribute index ${idx} doesn't have max`);
      }

      R20.wipeObjectStorage(pc.abilities);
      R20.wipeObjectStorage(pc.attribs);

      let save = get_default_save();
      save.name = data.name;
      save.avatar = data.avatar;

      let blobs = get_default_blobs();
      blobs.bio = data.bio;
      pc.updateBlobs(blobs);

      for(let importAttrib of data.attribs) {
        pc.attribs.create(importAttrib);
      }

      pc.save(save, { success: (v) => {
        resolve();
      }});
    });
  }
}

class OverwriteV2 implements IOverwriteStrategy {
  overwrite = (pc: Character, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log("Schema 2");

      const hasNot = what => !(what in data);

      //if (hasNot("oldId")) return new Err("oldId not found");
      if (hasNot("name")) return reject("name not found");
      if (hasNot("avatar")) return reject("avatar not found");
      if (hasNot("bio")) return reject("bio not found");
      if (hasNot("gmnotes")) return reject("gmnotes not found");
      if (hasNot("defaulttoken")) return reject("defaulttoken not found");
      if (hasNot("tags")) return reject("tags not found");
      if (hasNot("controlledby")) return reject("controlledby not found");
      if (hasNot("inplayerjournals")) return reject("inplayerjournals not found");
      if (hasNot("attribs")) return reject("attribs not found");
      if (hasNot("abilities")) return reject("abilities not found");

      let idx = 0;
      for (let el of data.attribs) {
          if (!("name" in el)) return reject(`Attribute index ${idx} doesn't have name`);
          if (!("current" in el)) return reject(`Attribute index ${idx} doesn't have current`);
          if (!("max" in el)) return reject(`Attribute index ${idx} doesn't have max`);
          if (!("id" in el)) return reject(`Attribute index ${idx} doesn't have id`);
          idx++;
      }

      idx = 0;
      for (let el of data.abilities) {
          if (!("name" in el)) return reject(`Ability index ${idx} doesn't have name`);
          if (!("description" in el)) return reject(`Ability index ${idx} doesn't have description`);
          if (!("istokenaction" in el)) return reject(`Ability index ${idx} doesn't have istokenaction`);
          if (!("action" in el)) return reject(`Ability index ${idx} doesn't have action`);
          if (!("order" in el)) return reject(`Ability index ${idx} doesn't have order`);
          idx++;
      }

      R20.wipeObjectStorage(pc.abilities);
      R20.wipeObjectStorage(pc.attribs);

      // some attributes store the id of the exported character
      // we replace them here with the new id 

      if(data.oldId) {
        let jsonData = JSON.stringify(data);
        jsonData = replaceAll(jsonData, data.oldId, pc.attributes.id);
        data = JSON.parse(jsonData);
      }

      // replace represents id
      const hasToken = data.defaulttoken && data.defaulttoken.length > 0;

      if(data.oldId) {
        if (hasToken) {
          data.defaulttoken = replaceAll(data.defaulttoken, data.oldId, pc.attributes.id);
        }
      }

      let save = get_default_save();
      save.name = data.name;
      save.avatar = data.avatar;
      save.tags = data.tags;
      save.controlledby = data.controlledby;
      save.inplayerjournals = data.inplayerjournals;
      save.defaulttoken= "";

      {
        let blobs = get_default_blobs();
        blobs.bio = data.bio;

        if(R20.isGM()) {
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

      for(let importAttrib of data.attribs) {
        pc.attribs.create(importAttrib);
      }

      for(let abil of data.abilities) {
        pc.abilities.create(abil);
      }

      pc.save(save, { success: (v) => {
        resolve();
      }});
    });
  }
}

namespace CharacterIO {

    export const formatVersions: { [id: number]: IOverwriteStrategy } = {
        1: new OverwriteV1(),
        2: new OverwriteV2()
    };

    export const exportSheet = (sheet, doneCallback) => {

        const blobPromise = new Promise(ok => sheet._getLatestBlob("defaulttoken", () => { ok(false);}));

        // NOTE(justasd): 3 second timeout for the blobpromise
        const waitPromise = promiseWait(3000, true);

        Promise.race([blobPromise, waitPromise])
            .then(didTimeout => {
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
}

export {CharacterIO, IOverwriteStrategy};
