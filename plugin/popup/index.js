var sending = browser.runtime.sendMessage(null, {
    background: {type: "get_hooks"}
});


function drawHooks(hooks) {

    console.log("drawing hooks");
    console.log(hooks);

    let root = document.getElementById("hooks");
    console.log(root);

    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }

    for(let i = 0; i < hooks.length; i++) {
        let hook = hooks[i];

        let elem = document.createElement("div");
        let input = document.createElement("input");
        input.type = "checkbox";
        input.checked = hook.enabled;
        input.onclick = (e) => { 
            var sending = browser.runtime.sendMessage(null, {
                background: {
                    type: "update_hook_enabled",
                    hookId: i,
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

//    <input type="checkbox">Developer mode</input>


