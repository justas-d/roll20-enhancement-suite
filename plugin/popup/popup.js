var sending = browser.runtime.sendMessage(null, {
    background: {type: "get_hooks"}
});

function notifyBackendOfHookMutation(hook, id) {
    console.log("Popup is notifying backend of hook config mutation!");

    browser.runtime.sendMessage(null, {
        background: {
            type: "update_hook_config",
            hookId: id,
            config: hook.config
        }
    });
}

function drawSettings(parent, hook, id) {
    let root = document.createElement("div");
    root.classList.add("settings");
    root.id = id;
    parent.appendChild(root);

    for(let cfgId in hook.config) {
        let cfgView = hook.configView[cfgId];
        
        if(cfgId === "enabled") continue;

        if(cfgView.type === "string") {
            let prop = document.createElement("setting");
            
            let text = document.createElement("span");
            text.innerHTML = cfgView.display;
            prop.appendChild(text);

            let input = document.createElement("input");
            input.type="text";
            input.value = hook.config[cfgId] || "";
            input.addEventListener("change", (e) => {
                hook.config[cfgId] = e.target.value;
            });

            prop.appendChild(input);
            
            root.appendChild(prop);

        } else if(cfgView.type === "dropdown") {
            let prop = document.createElement("setting");

            let text = document.createElement("span");
            text.innerHTML = cfgView.display;
            prop.appendChild(text);

            let select = document.createElement("select");
            prop.appendChild(select);
        
            select.addEventListener("change", (e) => {
                hook.config[cfgId] = e.target.value;
            });

            for(let val in cfgView.dropdownValues) {
                let disp = cfgView.dropdownValues[val];

                let opt = document.createElement("option");
                opt.value = val;
                opt.innerHTML = disp;
                select.appendChild(opt);
            }

            select.value = hook.config[cfgId];
            root.appendChild(prop);

        } else {
            alert(`Unknown config type: ${cfgView.type}`);
        }
    }

    let button = document.createElement("button");
    button.innerHTML = "Save";
    button.addEventListener("click", () => {
        notifyBackendOfHookMutation(hook, id);
    });

    root.appendChild(button);
}

function hideSettings(parent, hook, id) {
    let root = document.getElementById(id);
    if(!root) return false;

    root.remove();
    return true;
}

function drawHooks(hooks) {

    let hooksRoot = document.getElementById("hooks");

    while (hooksRoot.firstChild) {
        hooksRoot.removeChild(hooksRoot.firstChild);
    }

    for(let key in hooks) {
        let hook = hooks[key];
        if(hook.force) continue;

    
        let root = null;

        let hasConfig = hook.configView;
        if(hasConfig) {
            root = document.createElement("div");
            hooksRoot.appendChild(root);
        } else {
            root = hooksRoot;
        }
        
        let elem = document.createElement("div");
        let input = document.createElement("input");
        
        input.type = "checkbox";
        input.checked = hook.config.enabled;

        input.addEventListener("click", (e) => { 
            hook.config.enabled = e.target.checked;
            notifyBackendOfHookMutation(hook, key);
        });

        elem.appendChild(input);        
        
        let span = document.createElement("span");

        if(hasConfig) {
            let innerSpan = document.createElement("span");
            innerSpan.innerHTML = hook.name;
            span.appendChild(innerSpan);

            let icon = document.createElement("span");
            icon.classList.add("icon-span");
            icon.innerHTML = "▼";
            span.appendChild(icon);
            
            elem.addEventListener("mouseenter", () => {
                elem.classList.add("selected-item");
            });

            elem.addEventListener("mouseleave", () => {
                elem.classList.remove("selected-item");
            });

            span.addEventListener("click", () => {
                if(!hideSettings(root, hook, key))
                    drawSettings(root, hook, key);
            });
        } else {
            span.innerHTML = hook.name;
        }

        elem.appendChild(span);
        
        root.appendChild(elem);
    }
}

browser.runtime.onMessage.addListener((msg) => {
    if(msg.popup && msg.popup.type === "receive_hooks") {
        console.log(msg.popup.hooks);
        drawHooks(msg.popup.hooks);
    }
});