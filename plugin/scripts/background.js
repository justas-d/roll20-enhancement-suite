hooks = [
    {
        includes: "/editor/startjs/",
        find: "environment: \"production\"",
        patch: "environment: \"development\"",
    },

    {
        includes: "assets/app.js",
        //        find: "}n.restore()}",
        //        patch: "}window.r20es.tokenDrawBg(n, o, r, i); n.restore();}"
        find: "this.model.view.updateBackdrops(e),this.active",
        patch: "this.model.view.updateBackdrops(e), window.r20es.tokenDrawBg(e, this), this.active",
    }
];

function listener(dt) {
    for(let hook of hooks) {
        if(dt.url.includes(hook.includes)) {
            console.log(`[${hook.includes}] patching`);
            let filter = browser.webRequest.filterResponseData(dt.requestId);
            let decoder = new TextDecoder("utf-8");
            let encoder = new TextEncoder();

            let str = "";
                filter.ondata = event => {
                str += decoder.decode(event.data, {stream: true});
            };

            filter.onstop = event => {
                str = str.replace(hook.find, hook.patch);
                console.log(`[${hook.includes}] done!`);
                
                filter.write(encoder.encode(str));
                filter.close();
            };
        }
    }
}

browser.webRequest.onBeforeRequest.addListener(
    listener,
    {urls: ["*://app.roll20.net/*"]},
    ["blocking"]);

console.log("r20es Background hook script initialized");


