window.r20es = window.r20es || {};
window.r20esDisposeTable = window.r20esDisposeTable || {};

if (!("isLoading" in window.r20es)) {
    window.r20es.isLoading = true;
}

window.r20es.canInstallModules = true;

function recvPluginMsg(e) {

    if (e.data.r20es_hooks) {
        e.stopPropagation();
        console.log("Page received hooks from backend!");
        window.r20es.hooks = e.data.r20es_hooks;
    }
}

window.removeEventListener("message", recvPluginMsg);
window.addEventListener("message", recvPluginMsg);

window.r20es.onAppLoad = window.r20es.onAppLoad || { listeners: [] };

window.r20es.onAppLoad.fire = function () {
    if (window.r20es.isWindowLoaded) return;
    window.r20es.isWindowLoaded = true;

    for (let listener of window.r20es.onAppLoad.listeners) {
        listener();
    }
}

window.r20es.onAppLoad.addEventListener = function (fx) {
    window.r20es.onAppLoad.listeners.push(fx);
}

window.r20es.onAppLoad.removeEventListener = function (fx) {
    let idx = window.r20es.onAppLoad.listeners.length;

    while(idx --> 0) {
        let cur = window.r20es.onAppLoad.listeners[idx];
        if(cur === fx) {
            window.r20es.onAppLoad.listeners.splice(cur, 1);
        }
    }
}

window.r20es.onAppLoad.addEventListener(_ => window.r20es.isLoading = false);

window.r20es.replaceAll = function (where, find, replace) {
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    return where.replace(new RegExp(escapeRegExp(find), 'g'), replace);

}