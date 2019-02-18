import {R20Module} from '../../utils/R20Module'
import {LIBRE_AUDIO_TRACK_KEY} from "./Constants";
import {JukeboxSong} from 'roll20';
import {R20} from "../../utils/R20";
import {DOM} from "../../utils/DOM";
import {findByIdAndRemove} from "../../utils/MiscUtils";

class LibreAudio extends R20Module.SimpleBase {
    constructor() {
        super(__dirname);
    }

    _addTrackWidgetId = "r20es-libre-audio-add-track-widget";

    uiInsertAddTrackWidget = () => {
        const root = document.getElementById("superjukeboxadd");
        if(!root) {
            console.error("[LibreAudio] uiInsertAddTrackWidget failed to find widget root (id: superjukeboxadd)");
            return;
        }

        const listRoot = $(root).find("ul")[0];
        if(!listRoot) {
            console.error("[LibreAudio] uiInsertAddTrackWidget failed to find listRoot");
            return;
        }

        const widget = (
            <li id={this._addTrackWidgetId}>
                <a href="javascript:void(0)" onClick={this.uiOnClickAddTrack}>R20ES: Add Track By URL</a>
            </li>
        );

        listRoot.appendChild(widget);
    };

    uiRemoveAddTrackWidget = () => {
        findByIdAndRemove(this._addTrackWidgetId);
    };

    uiOnClickAddTrack = () => {
        const url = prompt(`Insert a Track URL.
Disclaimer: players must have the extension installed in order to hear this track.`, "www.example.com/audio.mp3");
        const testElement = document.createElement("audio") as any;
        testElement.crossorigin = "anonymous";
        testElement.volume = 0;

        const removeEventListeners = () => {
            testElement.pause();
            testElement.removeEventListener("error", onError);
            testElement.removeEventListener("canplay", onCanPlay);
            testElement.src = "";
        };

        const onError = e => {
            removeEventListeners();
            console.error(e);
            alert("Could not load audio. The URL is most likely not a direct audio stream.");
        };

        const onCanPlay = e => {
            removeEventListeners();

            const split = url.split("/");
            const name = split[Math.max(0, split.length - 1)];

            R20.createSong({
                loop: false,
                playing: false,
                softstop: false,
                /*
                    Note(justas): Fanburst sources have special logic:
                        no soundcloud deprecation message
                        no soundcloud api key query string
                 */
                source: "Fanburst",
                [LIBRE_AUDIO_TRACK_KEY]: true,
                title: name,
                track_id: url,
                volume: 100
            });
        };

        testElement.addEventListener("error", onError);
        testElement.addEventListener("canplay", onCanPlay);

        testElement.src =  url;
        testElement.play();
    };

    tryPlaySound = (audio: JukeboxSong) => {
        const url = audio.attributes.track_id;

        if(audio.attributes[LIBRE_AUDIO_TRACK_KEY]) {
            R20.playAudio(url, url);
            return true;
        }

        return false;
    };

    public setup = () => {
        window.r20es["tryPlaySound"] = this.tryPlaySound;
        this.uiInsertAddTrackWidget();
    };

    public dispose = () => {
        window.r20es["tryPlaySound"] = undefined;
        this.uiRemoveAddTrackWidget();
    }
}

if (R20Module.canInstall()) new LibreAudio().install();

