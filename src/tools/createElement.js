function createElement(type, _attributes, children, parent) {
    let elem = document.createElement(type);
    const attributes = _attributes || {};

    let isEvent = (what) => what.startsWith("on");
    let getEventName = (what) => what.substring(2).toLowerCase();

    function recursiveAddChildren(ch) {
        for (let child of ch) {
            if (!child) continue;
            if (typeof (child) === "function") {
                recursiveAddChildren(child());
            } else {
                elem.appendChild(child);
            }
        }
    }

    if (children) {
        recursiveAddChildren(children);
    }

    for (let attribId in attributes) {
        let val = attributes[attribId];

        if (attribId === "innerHTML") {
            elem.innerHTML = val;
        } else if (attribId === "value") {
            elem.value = val;
        } else if (attribId === "checked") {
            elem.checked = val;
        } else if (attribId === "style") {
            for (let elemId in val) {
                elem.style[elemId] = val[elemId];
            }
        } else if (attribId === "className") {
            if (typeof (val) === "object" && "length" in val) {
                for (let className of val) {
                    elem.classList.add(className);
                }
            } else {
                elem.className = val;
            }
        } else if (isEvent(attribId)) {
            elem.addEventListener(getEventName(attribId), val);
        } else {
            elem.setAttribute(attribId, val);
        }
    }

    if (parent) {
        parent.appendChild(elem);
    }

    return elem;
}


function createSidebarSeparator() {
    const addClear = _ =>
        createElement("div", {
            className: "clear",
            style: { height: 10 }
        });

    return [
        addClear(),
        createElement("hr"),
        addClear()
    ];

}

export { createElement, createSidebarSeparator};