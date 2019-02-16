export const getHooks = (hooks, url) => {

    let hookQueue = [];

    const addModToQueueIfOk = (mod, hook) => {
        if (mod.includes && url.includes(mod.includes) && mod.find && mod.patch) {
            hookQueue.push({mod, hook});
        }
    };

    for (let id in hooks) {
        let hook = hooks[id];

        if (hook.mods) {
            for (let mod of hook.mods) {
                addModToQueueIfOk(mod, hook);
            }
        } else {
            addModToQueueIfOk(hook, hook);
        }
    }

    return hookQueue;
};

export const injectHooks = (intoWhat, hookQueue, replaceFunc) => {
    if (hookQueue.length <= 0) return intoWhat;

    for (let combo of hookQueue) {
        const mod = combo.mod;

        // TODO : move this to Configs.js?
        const patch = replaceFunc(mod.patch, ">>R20ES_MOD_FIND>>", mod.find);

        console.log(`REPLACING: Find: ${mod.find} Patch: ${patch}`);
        intoWhat = replaceFunc(intoWhat, mod.find, patch);
    }

    return intoWhat;
};