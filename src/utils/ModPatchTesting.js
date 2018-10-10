class ModPatchTesting {
    constructor(hooks) {
        console.log(hooks);
        this.hookTable = {};
        this.wasAnyModHooked = false;

        for (let hookId in hooks) {
            const hook = hooks[hookId];

            this.addMod(hook, hook);

            if (hook.mods) {
                for (let mod of hook.mods) {
                    this.addMod(hook, mod);
                }
            }

        }
    }

    addMod(hook, mod) {
        if (!("includes" in mod) || !("patch" in mod) || !("find" in mod)) return;

        if (!this.hookTable[hook.id]) {
            this.hookTable[hook.id] = {};
        }

        const modTable = this.hookTable[hook.id];

        if (!modTable[mod.find]) {
            modTable[mod.find] = {
                got: 0,
                expected: "expectedPatchCount" in mod ? mod.expectedPatchCount : 1,
                mod: mod,
                hook: hook
            };
        }
    }

    onModHooked(mod, hook) {
        this.wasAnyModHooked = true;
        this.hookTable[hook.id][mod.find].got++;
    }

    verifyModHooks() {
        if(!this.wasAnyModHooked) {
            console.error("No mods were hooked. This is likely due to a plugin reload. Refresh the page and try again.");
            return;
        }

        let failures = [];

        for (let hookId in this.hookTable) {
            const mods = this.hookTable[hookId];

            for (let modId in mods) {
                const modData = mods[modId];

                const msg = `${modData.mod.find} -> ${modData.mod.patch} x ${modData.got}/${modData.expected}`;
                if (modData.got === modData.expected) {
                    console.log(`[OK] ${msg}`);
                } else {
                    console.error(`[FAILURE] ${msg}`);;
                    failures.push(modData);
                }
            }
        }

        console.log("==================================================");

        if(failures.length <= 0) {
            console.log("ALL OK!");
            return;
        }

        for (let modData of failures) {
            const mod = modData.mod;
            const hook = modData.hook;

            console.error("Mod failed to meed expected patch quota:");
            console.table({
                "Expected patches": modData.expected,
                "Got patches": modData.got,
                "Mod find": mod.find,
                "Mod patch": mod.patch,
                "Parent hook name": hook.name,
                "Parent hook id": hook.id
            });
        }
    }
}

export { ModPatchTesting }