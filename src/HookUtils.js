import {replace_all_and_count} from "utils/MiscUtils";

export const getHooks = (hooks, url) => {
  let hookQueue = [];

  for(let id in hooks) {
    let hook = hooks[id];

    if(hook.mods) {
      for (let mod of hook.mods) {
        if (mod.includes && url.includes(mod.includes) && mod.find && mod.patch) {
          hookQueue.push({mod, hook});
        }
      }
    } 
  }

  return hookQueue;
};

export const injectHooks = (into_what, hook_queue) => {
  if(hook_queue.length <= 0) {
    return into_what;
  }

  for(let combo of hook_queue) {
    const mod = combo.mod;
    const hook = combo.hook;

    // TODO : move this to Configs.js?
    let replace = replace_all_and_count(mod.patch, ">>R20ES_MOD_FIND>>", mod.find);
    const patch = replace.result;

    replace = replace_all_and_count(into_what, mod.find, patch);
    into_what = replace.result;

    {
      const str = `REPLACING: Replace count: ${replace.count} Find: '${mod.find}' Patch: '${patch}'.`;

      if(replace.count <= 0) {
        console.error(str, hook);
      }
      else {
        console.log(str);
      }
    }
  }

  return into_what;
};

