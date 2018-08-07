import { R20Module } from "../tools/r20Module";

const hook = {
    id: "changeRepresentsIdWhenDuplicating",
    name: `Reassign "Represents" when duplicating`,
    description: `This will make sure that if a character, who we want to duplicate, has default token, the character that he default token represents will be set to the duplicated character.`,
    category: R20Module.category.token,
    gmOnly: true,

    includes: "assets/app.js",
    find: "o.defaulttoken=e.model._blobcache.defaulttoken",
    patch: `o.defaulttoken = window.r20es.replaceAll(e.model._blobcache.defaulttoken, e.model.get("id"), n.get("id"))`
}

export { hook as ChangeIdWhenDuplicatingHook }