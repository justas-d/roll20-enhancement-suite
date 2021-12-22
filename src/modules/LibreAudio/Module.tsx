import {R20Module} from '../../utils/R20Module'
import {LIBRE_AUDIO_TRACK_KEY} from "./Constants";
import {R20} from "../../utils/R20";
import {DOM} from "../../utils/DOM";
import {findByIdAndRemove} from "../../utils/MiscUtils";
import LibreAudioDialogWidget from "./LibreAudioDialogWidget";

class LibreAudio extends R20Module.OnAppLoadBase {
    constructor() {
        super(__dirname);
    }

    private add_url_dialog: LibreAudioDialogWidget;

    _addTrackWidgetId = "r20es-libre-audio-add-track-widget";

    uiInsertAddTrackWidget = () => {
        const before_root = document.getElementById("addjukebox");
        if(!before_root) {
            console.error("[LibreAudio] uiInsertAddTrackWidget failed to find widget before_root (id: addjukebox)");
            return;
        }

        const widget = (
            <button id={this._addTrackWidgetId} className="btn" onClick={this.uiOnClickAddTrack}>VTTES: Add Track</button>
        );

        before_root.parentNode.insertBefore(widget, before_root);
    };

    tryUpgradeTrackToNewestLibreAudioTrackVersion = (track: Roll20.JukeboxSong) => {
        /*
            NOTE(justas): convert between LibreAudio track versions
            Current: v2

            v1 -> v2 changes:  source changed from "Fanburst" to "My Audio"
         */

        //console.log("Trying to upgrade", track);

        if(track.attributes[LIBRE_AUDIO_TRACK_KEY]) {
            // v1 -> v2
            if(track.attributes.source === "Fanburst") {
                track.save({
                    source: "My Audio"
                })
            }
        }
    };

    databaseOnAddJukeboxTrack = (ref: Roll20.FirebaseReference<Roll20.JukeboxSongAttributes>) => {

        // NOTE(justas); we delay here so that the object is basically guaranteed to be stored in Roll20's firebase objs
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
        this.add_url_dialog.show();
    };

    canPlaySound = (audio: Roll20.JukeboxSong) => {
        console.log("querying", audio);

        if(audio.attributes[LIBRE_AUDIO_TRACK_KEY]) {
            return true;
        }
        return false;
    };

    /*
    playSound= (audio: Roll20.JukeboxSong) => {
        console.log("playing", audio);
        const url = audio.attributes.track_id;
        R20.playAudio(url, url);
    };
    */

    ui_on_add_url_dialog_close = (e) => {
        const data = this.add_url_dialog.getData();
        if (!data) {
            return;
        }

        for(const track_data of data) {
            const created_track = R20.createSong({
                loop: false,
                playing: false,
                softstop: false,

                source: "My Audio",
                [LIBRE_AUDIO_TRACK_KEY]: true,

                title: track_data.title,
                track_id: track_data.url,
                volume: track_data.volume
            });

            R20.addTrackToPlaylist(created_track.id, track_data.playlist);
        }
    };

    public earlySetup = () => {
        window.r20es["canPlaySound"] = this.canPlaySound;
    };

    public setup = () => {
        window.Jukebox.playlist.backboneFirebase.reference.on("child_added", this.databaseOnAddJukeboxTrack);

        {
            this.add_url_dialog = new LibreAudioDialogWidget();
            this.add_url_dialog .getRoot().addEventListener("close", this.ui_on_add_url_dialog_close);
        }

        this.uiInsertAddTrackWidget();
    };

    public dispose = () => {

        if(this.add_url_dialog) {
            this.add_url_dialog.dispose()
        }

        {
            window.r20es["canPlaySound"] = undefined;
            window.Jukebox.playlist.backboneFirebase.reference.off("child_added", this.databaseOnAddJukeboxTrack);
        }

        this.uiRemoveAddTrackWidget();
    }
}

export default () => {
  new LibreAudio().install();
};

