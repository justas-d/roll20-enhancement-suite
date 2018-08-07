let MiscUtil = {};

MiscUtil.copy = function (what, overrides) {
    let copy = Object.assign({}, what);
    if (overrides) {
        copy = Object.assign(copy, overrides);
    }
    return copy;
}

MiscUtil.getTransform = function (ctx) {
    if ('currentTransform' in ctx) {
        return ctx.currentTransform
    }
    // restructure FF's array to an Matrix like object
    else if (ctx.mozCurrentTransform) {
        let a = ctx.mozCurrentTransform;
        return { a: a[0], b: a[1], c: a[2], d: a[3], e: a[4], f: a[5] };
    }
};

MiscUtil.getRotation = function (ctx) {
    let t = MiscUtil.getTransform(ctx);
    let rad = Math.atan2(t.b, t.a);
    if (rad < 0) { // angle is > Math.PI
        rad += Math.PI * 2;
    }
    return rad;
};

export { MiscUtil };
