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
    }
    // restructure FF's array to an Matrix like object
    else if (ctx.mozCurrentTransform) {
        let a = ctx.mozCurrentTransform;
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

function concatClassName(props, className) {
    let ret = null;
    if(props && props.className) {
        if(Array,isArray(props.className)) {
            ret = [...props.className, className];
        } else {
            ret = `${props.className} ${className}`;
        }
    } else {
        ret = className;
    }
    return ret;
}

export { concatClassName, replaceAll, escapeRegExp, findByIdAndRemove, copy, getTransform, getRotation, basename, safeCall, removeAllChildren };
