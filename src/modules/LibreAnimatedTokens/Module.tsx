import {R20Module} from '../../utils/R20Module'
import {R20} from "../../utils/R20";
import getFabric = R20.getFabric;

class LibreAnimatedTokens extends R20Module.SimpleBase {
    constructor() {
        super(__dirname);
    }

    resolveAnimatedThumbnail = (token: object, url: string) => {
        console.log("resolveAnimatedThumbnail", token, url);

        return "https://i.imgur.com/qarmF0Z.jpg";
    };

    modifiedFromURL = (url, unknown_callback, params: any) => {
        console.log("modifiedFromURL", url, unknown_callback, params);

        const i = `Could not load image from ${url}`, o = params && params.video ? "video" : "img", r = window["_"].clone(url);
        let a, s = R20.getFabric().document.createElement(o);

        console.log(s, o);

        /*
        if(params.usecors) {
            s.crossOrigin = "anonymous";

            if(url.indexOf("d20cors.herokuapp.com") !== -1) {
                url = url.replace("d20cors.herokuapp.com", "imgsrv.roll20.net:5100")
            }

            if(url.indexOf(".d20.io") == -1 && url.indexOf("d20cors.herokuapp.com") === -1 && url.indexOf("imgsrv.roll20.net") === -1) {
                url = "http://imgsrv.roll20.net:5100/?src=" + escape(url.replace(/http[s]*:\/\//, "")) + "&cb=";
            }

            if(url.indexOf("files.d20.io") > -1 && url.indexOf("?") === -1) {
                url += "?";
            }
            if("development" == window.d20["environment"]) {
                url += "3";
            }
            else if("staging" == window.d20["environment"]) {
                url += "4"
            }
            else {
                url += "5";
            }
        }
        */

        const load_callback = function () {

            s.removeEventListener("loadeddata", load_callback);
            s.removeEventListener("error", a);

            if(params.video) {
                s.width = s.videoWidth;
                s.height = s.videoHeight;
                s.muted = !0;
            }

            if (params.element_only) {
                unknown_callback(s);
            }
            else {
                const e = new (R20.getFabric().Image)(s, params);
                if (params.video_sample) {
                    const n = n => {
                        e.setElement(n);
                        unknown_callback(e);
                    };

                    e._animated = !0;
                    e._placeholder = s;

                    this.modifiedFromURL(s.src.replace("sample.png", "med.webm"), n, {
                        usecors: true,
                        video: true,
                        element_only: true
                    });
                }
                else {
                    unknown_callback(e);
                }
            }
        };

        let error_callback = null;

        if(params.usecors) {
            error_callback = function () {
                if(params.video) {
                    s.removeEventListener("loadeddata", load_callback);
                }
                else {
                    s.removeEventListener("load", load_callback);
                    s.removeEventListener("error", error_callback);
                    error_callback = function () {
                        if(params.video) {
                            s.removeEventListener("loadeddata", load_callback)
                        }
                        else {
                            s.removeEventListener("load", load_callback);
                            s.removeEventListener("error", error_callback);
                            console.error(i);
                        }
                    };

                    console.warn("Error loading graphic, probably due to CORS. Trying once without CORS for " + r);
                    params.usecors = !1;
                    s = R20.getFabric().document.createElement(o);

                    if(params.video) {
                        s.addEventListener("loadeddata", load_callback);
                        s.preload = "auto";
                    }
                    else {
                        s.addEventListener("load", load_callback);
                        s.addEventListener("error", error_callback);
                        s.src = r;
                    }
                }
            }
        }
        else {
            error_callback = () => console.error(i);
        }

        if(params.video) {
            // @ts-ignore
            if(!window.d20.engine.debug_video_elements) {
                // @ts-ignore
                window.d20.engine.debug_video_elements = [];
            }

            // @ts-ignore
            d20.engine.debug_video_elements.push(s);
            s.addEventListener("loadeddata", load_callback);
            s.preload = "auto";
        }
        else {
            s.addEventListener("load", load_callback);
            s.addEventListener("error", error_callback);
            s.src = url;
        }
    };

    bypassHostAndQueryMangling = (url: string, t: object, n: object) => {
        console.log("bypassHostAndQueryMangling ", url, t, n);

        return url;
    };

    public setup = () => {
        window.r20es["modifiedFromURL"] = this.modifiedFromURL;
        window.r20es["resolveAnimatedThumbnail"] = this.resolveAnimatedThumbnail;
        window.r20es["bypassHostAndQueryMangling"] = this.bypassHostAndQueryMangling;
    };

    public dispose = () => {
        window.r20es["modifiedFromURL"] = undefined;
        window.r20es["bypassHostAndQueryMangling"] = undefined;
        window.r20es["resolveAnimatedThumbnail"] = undefined;
    }
}

//var r=i.split("/"),a=r[r.length - 1].split(".")[0];

if (R20Module.canInstall()) new LibreAnimatedTokens().install();

