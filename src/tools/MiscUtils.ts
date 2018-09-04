import { detect as detectBrowser } from "detect-browser";
import { Config } from "./Config";

const copy = function(what, overrides) {
    let copy = Object.assign({}, what);
    if (overrides) {
        copy = Object.assign(copy, overrides);
    }
    return copy;
}

const getTransform = function(ctx) {
    if ('currentTransform' in ctx) {
        return ctx.currentTransform
    } else if ("getTransform" in ctx) {
        return ctx.getTransform();
    } else if (ctx.mozCurrentTransform) {
        let a = ctx.mozCurrentTransform;
        // restructure FF's array to an Matrix like object
        return { a: a[0], b: a[1], c: a[2], d: a[3], e: a[4], f: a[5] };
    }
};

const getRotation = function(ctx) {
    let t = getTransform(ctx);
    let rad = Math.atan2(t.b, t.a);
    if (rad < 0) { // angle is > Math.PI
        rad += Math.PI * 2;
    }
    return rad;
};

const findByIdAndRemove = function(id) {
    const elem = document.getElementById(id);
    if (elem) {
        elem.remove();
    }
}

const mapObj = function(obj, fx) {
    return Object.keys(obj).reduce((accum, curVal) => {
        let val = fx(obj[curVal], curVal);

        if (val !== undefined && val !== null) {
            accum.push(val);
        }

        return accum;
    }, []);
}

const safeCall = function(fx) {
    try {
        fx();
    }
    catch (err) {
        console.error(err);
    }
}

const removeAllChildren = function(root) {
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
}

const replaceAll = function(where, find, replace) {

    const escapeRegExp = function(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    return where.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

const safeParseJson = function(str) {

    try {
        return JSON.parse(str);
    } catch (err) {
        alert("File is not a valid JSON file.");
    }
    return null;
}

const readFile = function(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject("No file given.");
            return;
        }

        let reader = new FileReader();
        reader.readAsText(file);

        reader.onload = e => {
            resolve((<any>e.target).result);
        };
    });
}

const getBrowser = () => chrome || browser;

const injectScript = function(name) {
    console.log(`Injecting ${name}`);

    var s = document.createElement("script");
    s.async = false;
    s.src = getBrowser().extension.getURL(name);

    s.onload = () => { s.remove(); };
    document.head.appendChild(s);
}

const isChrome = function() {
    return detectBrowser().name === "chrome";
}

const strIsNullOrEmpty = function(str) {
    return str === null || str === undefined || str.length <= 0 || str.trim().length <= 0;
}

const createCSSElement = function(css, id) {
    const el = document.createElement("style");
    el.innerHTML = css;
    el.id = id;
    return el;
}

const getExtUrlFromPage = function(resource: string, _waitMs: number): Promise<string> {
    const waitMs = (_waitMs === undefined || _waitMs === null) ? 1000 : _waitMs;

    return new Promise((ok, err) => {
        try {
            let worked = false;

            const removeCb = function() { window.removeEventListener("message", callback); }
            const reqId = window.generateUUID();

            const callback = function(e) {
                if (e.origin !== Config.appUrl) return;

                if (e.data.r20esGivesResourceUrl && e.data.r20esGivesResourceUrl.id === reqId) {
                    worked = true;
                    
                    removeCb();
                    ok(e.data.r20esGivesResourceUrl.url as string);
                }
            };

            window.addEventListener("message", callback);

            const payload = {
                resource,
                id: reqId
            };

            window.postMessage({ r20esWantsResourceUrl: payload }, Config.appUrl);

            setTimeout(() => {
                try {
                    if (!worked) {
                        removeCb();
                        err(`Timed out after ${waitMs}ms`);
                    }
                } catch (ex) { err(ex); }

            }, waitMs);
        } catch (ex) { err(ex); }
    });
}

const waitPromise = (timeMs, dataPassthrough) => {
    return new Promise((ok, err) => {
        setTimeout(() => {
            ok(dataPassthrough);
        }, timeMs);
    })
}

export {
    getBrowser, readFile, safeParseJson,
    replaceAll, findByIdAndRemove,
    copy, getTransform, getRotation,
    safeCall, removeAllChildren,
    injectScript, isChrome, strIsNullOrEmpty,
    mapObj, createCSSElement, getExtUrlFromPage,
    waitPromise
};

