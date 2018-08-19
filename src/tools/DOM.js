function rerender(root, renderFx) {

    const nextTo = root.nextSibling;
    const parent = root.parentNode;

    root.remove();

    const elem = renderFx();

    if (nextTo) {
        parent.insertBefore(elem, nextTo);
    } else {
        parent.appendChild(elem);
    }

    return elem;
}

function createElement(type, attributes, ...children) {

    let elem = null;
    const isFunc = typeof (type) === "function";

    if (isFunc && type.name && type.prototype instanceof DOM.ElementBase) {
        let base = new type(attributes);
        elem = base.render();
    } else if (isFunc) {
        elem = type(attributes);
    } else {
        elem = document.createElement(type);
    }

    if (!(elem instanceof HTMLElement)) {
        console.error($`JSX Render must return a valid element: elem is not an instance of HTMLElement`);

        console.table({
            [`"type" argument`]: type,
            "Type": typeof (elem),
            "Value": elem
        });

        console.trace();
        return null;
    }

    if (children) {
        let frag = document.createDocumentFragment();

        function recursiveAddChildren(recursiveChildren) {
            for (let child of recursiveChildren) {
                if (child instanceof HTMLElement) {
                    frag.appendChild(child);
                } else if (Array.isArray(child)) {
                    recursiveAddChildren(child);
                } else if (typeof (child) === "string") {
                    frag.appendChild(document.createTextNode(child));

                    // values that we assume are control flow related
                } else if (child === null || child === undefined || typeof (child) === "boolean") {
                    console.warn(`JSX got an unrenderable child value, assuming it's control flow related: type: ${typeof (child)} value: ${child}.`);
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
            } else if (typeof (val) === "string" && val.length > 0) {
                elem.className = (elem.className && elem.classList.length > 0)
                    ? `${elem.className} ${val}`
                    : val;
            }
        } else if (attribId === "style") {
            for (let elemId in val) {
                if (!val) continue;
                elem.style[elemId] = val[elemId];
            }
        } else if (attribId.startsWith("data")) {
            elem.setAttribute(attribId, val);
        } else {
            elem[attribId] = val;
        }
    }

    return elem;
}

class ElementBase {
    
    render() {
        const elem = this.internalRender();
        this.setRoot(elem);
        return elem;
    }

    internalRender() {}

    rerender() {
        const elem = rerender(this.getRoot(), () => { return this.render() });        
    }

    setRoot = root => this.elementRoot = root;
    getRoot = () => this.elementRoot;

    dispose() {
        this.getRoot().remove();
    }
}

const DOM = {
    ElementBase,
    rerender,
    createElement
};

function SidebarSeparator() {
    return (
        <span>
            <div className="style" style={{ height: "10px" }} />
            <hr />
            <div className="style" style={{ height: "10px" }} />
        </span>
    )
}

function SidebarCategoryTitle() {
    return <h3 style={{ marginBottom: "5px", marginLeft: "5px" }}></h3>
}

export { DOM, SidebarSeparator, SidebarCategoryTitle };
