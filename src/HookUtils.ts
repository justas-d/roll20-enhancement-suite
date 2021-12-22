import {replace_all_and_count} from "./utils/MiscUtils";

export const apply_mods_to_text = (
  into_what: string,
  url: string,
  configs: Record<string, VTTES.Module_Config>,
): string => {
  for(const config_id in configs) {
    const config = configs[config_id];

    if(!config.mods) {
      continue;
    }

    for(const mod of config.mods) {

      if(!url.includes(mod.includes)) {
        continue;
      }

      if(BUILD_CONSTANT_VTTES_IS_DEV) {
        if(mod.stability_checks) {
          for(const check of mod.stability_checks) {
            if(!into_what.includes(check)) {
              console.error(`STABILITY CHECK FAILED: '${check}'`, config);
            }
          }
        }
      }

      let replace = replace_all_and_count(mod.patch, ">>R20ES_MOD_FIND>>", mod.find);
      const patch = replace.result;

      replace = replace_all_and_count(into_what, mod.find, patch);
      into_what = replace.result;


      {
        const str = `REPLACING: Replace count: ${replace.count} Find: '${mod.find}' Patch: '${patch}'.`;

        if(replace.count <= 0) {
          console.error(str, config);
        }
        else {
          console.log(str);
        }
      }
    }
  }
  return into_what;
}

