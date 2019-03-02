import {R20Module} from '../../utils/R20Module'
import {LIBRE_AUDIO_TRACK_KEY} from "./Constants";
import {JukeboxSong, JukeboxSongAttributes} from 'roll20';
import {R20} from "../../utils/R20";
import {DOM} from "../../utils/DOM";
import {findByIdAndRemove} from "../../utils/MiscUtils";
import {FirebaseReference} from "roll20";

class LibreAudio extends R20Module.OnAppLoadBase {
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

    tryUpgradeTrackToNewestLibreAudioTrackVersion = (track: JukeboxSong) => {
        /*
            NOTE(stormy): convert between LibreAudio track versions
            Current: v2

            v1 -> v2 changes:  source changed from "Fanburst" to "My Audio"
         */

        console.log("Trying to upgrade", track);

        if(track.attributes[LIBRE_AUDIO_TRACK_KEY]) {
            // v1 -> v2
            if(track.attributes.source === "Fanburst") {
                track.save({
                    source: "My Audio"
                })
            }
        }
    };

    databaseOnAddJukeboxTrack = (ref: FirebaseReference<JukeboxSongAttributes>) => {

        // NOTE(stormy); we delay here so that the object is basically guaranteed to be stored in Roll20's firebase objs
        const attribs = ref.val();

        setTimeout(() => {
            const track = R20.getSongById(attribs.id);
            if(!track) {
                console.error(`[LibreAudio] databaseOnAddJukeboxTrack couldn't find track by id ${attribs.id}!`, attribs);
                return;
            }


            this.tryUpgradeTrackToNewestLibreAudioTrackVersion(track);

        }, 1000);
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

                source: "My Audio",
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

    canPlaySound = (audio: JukeboxSong) => {
        if(audio.attributes[LIBRE_AUDIO_TRACK_KEY]) {
            return true;
        }
        return false;
    };

    playSound= (audio: JukeboxSong) => {
        const url = audio.attributes.track_id;
        R20.playAudio(url, url);
    };

    public setup = () => {
        {
            window.r20es["canPlaySound"] = this.canPlaySound;
            window.r20es["playSound"] = this.playSound;
            window.Jukebox.playlist.backboneFirebase.reference.on("child_added", this.databaseOnAddJukeboxTrack);
        }

        this.uiInsertAddTrackWidget();
    };

    public dispose = () => {
        {
            window.r20es["canPlaySound"] = undefined;
            window.r20es["playSound"] = undefined;
            window.Jukebox.playlist.backboneFirebase.reference.off("child_added", this.databaseOnAddJukeboxTrack);
        }

        this.uiRemoveAddTrackWidget();
    }
}

if (R20Module.canInstall()) new LibreAudio().install();

