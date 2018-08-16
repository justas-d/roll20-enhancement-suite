import { detect as detectBrowser } from "detect-browser";

function copy(what, overrides) {
    let copy = Object.assign({}, what);
    if (overrides) {
        copy = Object.assign(copy, overrides);
    }
    return copy;
}

function getTransform(ctx) {
    if ('currentTransform' in ctx) {
        return ctx.currentTransform
    } else if("getTransform" in ctx) {
        return ctx.getTransform();
    } else if (ctx.mozCurrentTransform) {
        let a = ctx.mozCurrentTransform;
        // restructure FF's array to an Matrix like object
        return { a: a[0], b: a[1], c: a[2], d: a[3], e: a[4], f: a[5] };
    }
};

function getRotation(ctx) {
    let t = getTransform(ctx);
    let rad = Math.atan2(t.b, t.a);
    if (rad < 0) { // angle is > Math.PI
        rad += Math.PI * 2;
    }
    return rad;
};


function basename(str) {
    let idx = str.lastIndexOf('/');
    if (idx === -1) {
        return str;
    }
    idx += 1;

    if (idx >= str.length) {
        return "";
    }

    return str.substr(idx);
}

function findByIdAndRemove(id) {
    const elem = document.getElementById(id);
    if (elem) {
        elem.remove();
    }
}

function safeCall(fx) {
    try {
        fx();
    }
    catch (err) {
        console.error(err);
    }
}

function removeAllChildren(root) {
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(where, find, replace) {
    return where.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function safeParseJson(str) {

    try {
        return JSON.parse(str);
    } catch (err) {
        alert("File is not a valid JSON file.");
    }
    return null;
}

function readFile(file, callback) {
    if (!file) {
        alert("No file given.");
        return false;
    }

    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = callback;
    return true;
}

const getBrowser = _ => chrome || browser;

function injectScript(name) {
    console.log(`Injecting ${name}`);

    var s = document.createElement("script");
    s.async = false;
    s.src = getBrowser().extension.getURL(name);

    s.onload = () => { s.remove(); };
    document.head.appendChild(s);
}

function isChrome() {
    return detectBrowser().name === "chrome";
}

export {
    getBrowser, readFile, safeParseJson,
    replaceAll, escapeRegExp, findByIdAndRemove,
    copy, getTransform, getRotation,
    basename, safeCall, removeAllChildren,
    injectScript, isChrome
};

