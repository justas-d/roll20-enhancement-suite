var sending = browser.runtime.sendMessage(null, {
    background: {type: "get_hooks"}
});


function drawHooks(hooks) {

    let root = document.getElementById("hooks");

    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }

    for(let key in hooks) {
        let hook = hooks[key];
        if(hook.force) continue;

        let elem = document.createElement("div");
        let input = document.createElement("input");
        input.type = "checkbox";
        input.checked = hook.enabled;
        input.onclick = (e) => { 
            var sending = browser.runtime.sendMessage(null, {
                background: {
                    type: "update_hook_enabled",
                    hookId: key,
                    state: e.target.checked,
                }
            });
        }

        let span = document.createElement("span");
        span.innerHTML = hook.name;

        elem.appendChild(input);
        elem.appendChild(span);
        root.appendChild(elem);
    }
}

browser.runtime.onMessage.addListener((msg) => {
    if(msg.popup && msg.popup.type === "receive_hooks") {
        drawHooks(msg.popup.hooks);
    }
});
