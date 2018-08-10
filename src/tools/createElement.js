
class ElementBase {
    render() {}

    rerender() {
        const nextTo = this.elementRoot.nextSibling;
        const parent = this.elementRoot.parentNode;

        this.elementRoot.remove();
        
        const elem = this.render();
        this.setRoot(elem);
        parent.insertBefore(elem, nextTo);
    }

    setRoot = root => this.elementRoot = root;
}

function createElementJsx(type, attributes, ...children) {

    let elem = null;
    const isFunc = typeof(type) === "function";

    if(isFunc && type.name && type.prototype instanceof ElementBase) {
        let base = new type(attributes);
        elem = base.render();
        base.setRoot(elem);
    } else if(isFunc) {
        elem = type(attributes);
    } else {
        elem = document.createElement(type);
    }

    if (children) {
        let frag = document.createDocumentFragment();

        function recursiveAddChildren(recursiveChildren) {
            for (let child of recursiveChildren) {
                if(child instanceof HTMLElement)  {
                    frag.appendChild(child);
                } else if(Array.isArray(child)) {
                    recursiveAddChildren(child);
                } else if(typeof(child) === "string") {
                    frag.appendChild(document.createTextNode(child));

                // values that we assume are control flow related
                } else if(child === null || child === undefined || typeof(child) === "boolean") {
                    console.warn(`JSX got an unrenderable child value, assuming it's control flow related: type: ${typeof(child)} value: ${child}.`);
                } else {
                    console.error(`Unknown child type while proecssing JSX: ${child}`);
                }
            }
        }

        recursiveAddChildren(children);
        
        elem.appendChild(frag);
    }

    let isEvent = (what) => what.startsWith("on");
    let getEventName = (what) => what.substring(2).toLowerCase();

    for (let attribId in attributes) {
        let val = attributes[attribId];

        if (isEvent(attribId)) {
            elem.addEventListener(getEventName(attribId), val);
        } else if (attribId === "className") {
            if (val && Array.isArray(val)) {
                for (let className of val) {
                    elem.classList.add(className);
                }
            } else if(typeof(val) === "string" && val.length > 0) {
                elem.className = (elem.className && elem.classList.length > 0)
                    ? `${elem.className} ${val}`
                    : val;
            }
        } else if (attribId === "style") {
            for (let elemId in val) {
                if(!val) continue;
                elem.style[elemId] = val[elemId];
            }
        } else {
            elem[attribId] = val;
        }
    }

    //Object.assign(elem, attributes);

    return elem;
}

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
            if(!val) continue;
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

export { ElementBase, createElementJsx, createElement, createSidebarSeparator };