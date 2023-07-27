import {replace_all_and_count, escapeRegExp, replaceAll} from "./utils/MiscUtils";


interface Stencil_Data {
  stencil: VTTES.Replace_Stencil;
  start_index: number;
  end_index: number;
};

interface Replace {
  find: string;
  replace: string;
};

export const apply_mods_to_text = (
  into_what: string,
  url: string,
  configs: Record<string, VTTES.Module_Config>,
): string => {
  console.log(`Applying mods to url ${url}`);

  for(const config_id in configs) {
    const config = configs[config_id];

    if(!config.mods) {
      continue;
    }

    for(const mod of config.mods) {

      if(!url.includes(mod.includes)) {
        continue;
      }

      if(mod.stencils && !mod.debug_disable_stencils) {
        console.log("===========STENCILS FOR", config);
        let groups = {};
        let replace_data: Array<Stencil_Data> = [];
        let generated_replaces: Array<Replace> = [];

        stencil_loop: for(const stencil of mod.stencils) {
          if(stencil.debug_disable) continue;
          
          if(stencil.debug_find) {
            debugger;
          }

          let indexof_cursor = 0;

          if(stencil.search_from) {
            indexof_cursor = into_what.indexOf(stencil.search_from);
            if(indexof_cursor < 0) {
              console.error("STENCIL: Failed to find search_from", stencil.search_from, stencil, mod);
              continue stencil_loop;
            }

            if(typeof(stencil.search_from_index_offset) == "number") {
              indexof_cursor += stencil.search_from_index_offset;

              if(indexof_cursor < 0) indexof_cursor = 0;
            }
          }

          let start_str = stencil.find[0];
          if(typeof(start_str) != "string") {
            console.error("STENCIL: first part of a stencil is not a string.", stencil, mod);
            continue stencil_loop;
          }

          let start_index = into_what.indexOf(start_str, indexof_cursor);
          if(start_index < 0) {
            console.error("STENCIL: Failed to find the first part's start index", start_str, stencil, mod);
            continue stencil_loop;
          }

          const first_index = start_index;

          let group_index = stencil.find[1];
          if(typeof(group_index) == "number") {
            for(var i = 2; i < stencil.find.length; i += 2) {
              let end_str = stencil.find[i];
              if(typeof(end_str) != "string") {
                console.error(`STENCIL: part of a stencil at index ${i} is not a string.`, end_str, stencil, mod);
                continue stencil_loop;
              }

              let end_index = into_what.indexOf(end_str, start_index + start_str.length);
              if(end_index < 0) {
                console.error(`STENCIL: failed to find index of stencil part at index ${i}`, end_str, stencil, mod);
                continue stencil_loop;
              }

              if(group_index > 0) {
                let value = into_what.substring(start_index + start_str.length, end_index);

                if(typeof(groups[group_index]) == "string") {
                  if(groups[group_index] != value) {
                    console.error(`$Mismatched values between the same group! Group is ${group_index} and the current value is '${groups[group_index]}', whereas the new value is '${value}'.`, stencil, mod);
                    continue stencil_loop;
                  }
                }
                groups[group_index] = value;
              }

              indexof_cursor = end_index + end_str.length;

              start_str = end_str;
              start_index = end_index;

              group_index = stencil.find[i+1];
              if(typeof(group_index) == "string") {
                console.error("STENCIL: expected group index but got a string in find string!", stencil, mod);
                continue stencil_loop;
              }
              else if(typeof(group_index) == "number") {
                continue;
              }
              else {
                break;
              }
            }
          }
          else {
            // NOTE(justasd): the find string just has one string in it, which means we just want to
            // find something.
            // 2022-02-24
          }

          if(stencil.replace) {
            replace_data.push({
              stencil: stencil,
              start_index: first_index,
              end_index: start_index + start_str.length,
            });
          }
        }

        console.log("Stencil replace data", replace_data);
        replace_loop: for(const replace of replace_data) {
          if(replace.stencil.debug_replace) {
            debugger;
          }

          let str = "";
          const cutout = into_what.substring(replace.start_index, replace.end_index);

          for(const part of replace.stencil.replace) {
            if(typeof(part) == "string") {
              str = str + part;
            }
            else if(typeof(part) == "number") {
              if(part == 0) {
                str = str + cutout
              }
              else {
                const val = groups[part];
                if(typeof(val) != "string") {
                  console.error(`STENCIL: Could not find group ${part}`, replace);
                  continue replace_loop;
                }
                else {
                  str = str + val;
                }
              }
            }
          }


          const cmd : Replace = {
            find: cutout,
            replace: str
          };

          console.log("Generated replace:", cmd);

          generated_replaces.push(cmd);
        }

        for(const replace of generated_replaces) {
          into_what = replaceAll(into_what, replace.find, replace.replace);
        }

        console.log("Generated groups:", groups);
      }

      if(mod.find_replace && !mod.debug_disable_find_replace) {
        for(const find_replace of mod.find_replace) {
          if(BUILD_CONSTANT_VTTES_IS_DEV) {
            if(find_replace.stability_checks) {
              for(const check of find_replace.stability_checks) {
                if(!into_what.includes(check)) {
                  console.error(`STABILITY CHECK FAILED: '${check}'`, config);
                }
              }
            }
          }

          let replace = replace_all_and_count(
            find_replace.replace, 
            ">>R20ES_MOD_FIND>>", 
            find_replace.find
          );

          const patch = replace.result;

          replace = replace_all_and_count(into_what, find_replace.find, patch);
          into_what = replace.result;

          {
            const str = `REPLACING (${config.filename}): Replace count: ${replace.count} Find: '${find_replace.find}' Patch: '${patch}'.`;

            if(replace.count <= 0) {
              console.error(str, config);
            }
            else {
              console.log(str);
            }
          }
        }
      }
    }
  }

  return into_what;
}

