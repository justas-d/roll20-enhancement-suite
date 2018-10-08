import {IResult, Err, Ok} from './Result'
import {R20} from "./R20";

interface ICreateStrategy {
    create: (data: any) => IResult<boolean, string>;
}

class CreateV1 implements ICreateStrategy {
    create = (data: any): IResult<boolean, string> => {

        const hasNot = what => !(what in data);

        if (hasNot("playlists")) return new Err("playlists not found");
        let idx = 0;
        for (let el of data.playlists) {
            if (!("name" in el)) return new Err(`playlist index ${idx} doesn't have name`);
            if (!("songs" in el)) return new Err(`playlist index ${idx} doesn't have songs`);

            let songIdx = 0;
            for (let song of el.songs) {
                if (!("loop" in song)) return new Err(`song index ${songIdx} in playlist idx ${idx} doesn't have loop`);
                if (!("playing" in song)) return new Err(`song index ${songIdx} in playlist idx ${idx} doesn't have playing`);
                if (!("softstop" in song)) return new Err(`song index ${songIdx} in playlist idx ${idx} doesn't have softstop`);
                if (!("source" in song)) return new Err(`song index ${songIdx} in playlist idx ${idx} doesn't have source`);
                if (!("tags" in song)) return new Err(`song index ${songIdx} in playlist idx ${idx} doesn't have tags`);
                if (!("title" in song)) return new Err(`song index ${songIdx} in playlist idx ${idx} doesn't have title`);
                if (!("track_id" in song)) return new Err(`song index ${songIdx} in playlist idx ${idx} doesn't have track_id`);
                if (!("volume" in song)) return new Err(`song index ${songIdx} in playlist idx ${idx} doesn't have volume`);

                songIdx++
            }
            idx++;
        }

        const shapedData: Version1 = data;

        for(const rawPlaylist of shapedData.playlists) {
            const playlist = R20.createPlaylist(rawPlaylist.name);

            for(const rawSong of rawPlaylist.songs) {
                const song = R20.createSong();
                song.save(rawSong);

                R20.addSongToPlaylist(song, playlist);
            }
        }

        return new Ok(true);
    }
}

interface IApplyableSong {
    loop: boolean;
    playing: boolean;
    softstop: boolean;
    source: string;
    tags: string;
    title: string;
    track_id: string;
    volume: number;
}

interface IApplyableJukeboxPlaylist {
    name: string;
    songs: IApplyableSong[];
}

interface Version1 {
    schema_version: number;
    playlists: IApplyableJukeboxPlaylist[];
}

namespace JukeboxIO {

    import JukeboxPlaylist = R20.JukeboxPlaylist;
    export const formatVersions: { [id: number]: ICreateStrategy } = {
        1: new CreateV1(),
    };

    export const exportPlaylist = (playlist: JukeboxPlaylist[]) => {
        const payload: Version1 = {
            schema_version: 1,
            playlists: playlist.map(p => {
                const playlistRet: IApplyableJukeboxPlaylist = {
                    name: p.name,
                    songs: p.songs.map(s => {
                        const songRet: IApplyableSong = {
                            loop: s.attributes.loop,
                            playing: s.attributes.playing,
                            softstop: s.attributes.softstop,
                            source: s.attributes.source,
                            tags: s.attributes.tags,
                            title: s.attributes.title,
                            track_id: s.attributes.track_id,
                            volume: s.attributes.volume,
                        } ;
                        return songRet;
                    }),
                };
                return playlistRet;
            })
        };

        return payload;
    };
}
