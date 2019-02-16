import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "libreAnimatedTokens",
    name: "Libre Animated Tokens",
    description: "",
    category: Category.canvas,

    mods: [

        /*
        {
            includes: "assets/app.js",
            //find: `!0===n.usecors&&(s.crossOrigin="anonymous",-1!==e.indexOf("d20cors.herokuapp.com")&&(e=e.replace("d20cors.herokuapp.com","imgsrv.roll20.net:5100")),-1==e.indexOf(".d20.io")&&-1===e.indexOf("d20cors.herokuapp.com")&&-1===e.indexOf("imgsrv.roll20.net")&&(e="http://imgsrv.roll20.net:5100/?src="+escape(e.replace(/http[s]*:\\/\\//,""))+"&cb="),e.indexOf("files.d20.io")>-1&&-1===e.indexOf("?")&&(e+="?"),"development"==d20.environment?e+="3":"staging"==d20.environment?e+="4":e+="5");`,
            find: `!0===n.usecors&&(s.crossOrigin="anonymous",-1!==e.indexOf("d20cors.herokuapp.com")&&(e=e.replace("d20cors.herokuapp.com","imgsrv.roll20.net:5100")),-1==e.indexOf(".d20.io")&&-1===e.indexOf("d20cors.herokuapp.com")&&-1===e.indexOf("imgsrv.roll20.net")&&(e="http://imgsrv.roll20.net:5100/?src="+escape(e.replace(/http[s]*:\\/\\//,""))+"&cb="),e.indexOf("files.d20.io")>-1&&-1===e.indexOf("?")&&(e+="?"),"development"==d20.environment?e+="3":"staging"==d20.environment?e+="4":e+="5");`,
            patch: `

        },
*/
        {
            includes: "assets/app.js",
            find: `},fabric.Image.async=!0,fabric.Image.pngCompression=1)`,
            patch: `>>R20ES_MOD_FIND>>,
window.r20es.originalFromURL = fabric.Image.fromURL, 
fabric.Image.fromURL = (...params) => {
    if(window.r20es && window.r20es.modifiedFromURL) {
        window.r20es.modifiedFromURL(...params);
    }
    else {
        window.r20es.originalFromURL(...params);
    }
}
`,
        },
        {
            includes: "assets/app.js",
            find: `imageResolve:function(e){`,
            patch: `>>R20ES_MOD_FIND>> if(window.r20es && window.r20es.beforeImageResolve) { return window.r20es.beforeImageResolve(this, e); }`,
        },
        {
            includes: "assets/app.js",
            find: `||(t=t.replace(/(?:med|max|original)\\./,"thumb.")),i&&(t=t.replace(n,"sample.png"))`,
            patch: `|| (window.r20es && window.r20es.resolveAnimatedThumbnail && (t=window.r20es.resolveAnimatedThumbnail(this, t)))`
        }

        // (i="http://imgsrv.roll20.net/?src="+escape(i.replace(/http[s]*:\/\//,""))+"&cb=")
        // || (t = t.replace(/(?:med|max|original)\./, "thumb.")), i && (t = t.replace(n, "sample.png"))
    ]
});
