import {IResult, Err, Ok} from './Result'
import {R20} from "./R20";
import IOCommon from "./IOCommon";

interface IParseStrategy {
    parse: (data: any) => IResult<IApplyableJukeboxPlaylist[], string>;
}

class ParseV1 implements IParseStrategy {
    parse = (data: any): IResult<IApplyableJukeboxPlaylist[], string> => {

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
        return new Ok(shapedData.playlists);
    }
}

export interface IApplyableSong {
    loop: boolean;
    playing: boolean;
    softstop: boolean;
    source: string;
    tags: string;
    title: string;
    track_id: string;
    volume: number;
}

export interface IApplyableJukeboxPlaylist {
    name: string;
    mode: string;
    songs: IApplyableSong[];
}

interface Version1 {
    schema_version: number;
    playlists: IApplyableJukeboxPlaylist[];
}

export namespace JukeboxIO {

    import JukeboxPlaylist = R20.JukeboxPlaylist;
    const parseStrategies: { [id: number]: ParseV1 } = {
        1: new ParseV1(),
    };

    // TODO ; refactor this as it's duped between multiple IO things
    export const deserialize = (rawData: string): IResult<IApplyableJukeboxPlaylist[], string> => {
        const dataResult = IOCommon.parseRaw(rawData);
        if(dataResult.isErr()) return dataResult.map();
        const data = dataResult.ok().unwrap();

        const stratLookup = IOCommon.lookupStrategy(data, parseStrategies);
        if(stratLookup.isErr()) return stratLookup.map();

        return stratLookup.ok().unwrap().parse(data);
    }

    export const applyData = (playlists: IApplyableJukeboxPlaylist[]) => {
        for(const rawPlaylist of playlists) {
            const playlist = R20.createPlaylist(rawPlaylist.name, rawPlaylist.mode);

            for(const rawSong of rawPlaylist.songs) {
                const song = R20.createSong();
                song.save(rawSong);

                R20.addSongToPlaylist(song, playlist);
            }
        }
    };

    export const makeApplyablePlaylists = (playlists: JukeboxPlaylist[]): IApplyableJukeboxPlaylist[] => {
        return playlists.map(p => {
            const playlistRet: IApplyableJukeboxPlaylist = {
                name: p.name,
                mode: p.mode,
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

    export const serialize = (playlist: IApplyableJukeboxPlaylist[]) => {
        const payload: Version1 = {
            schema_version: 1,
            playlists: playlist
        };

        return JSON.stringify(payload, null, 4);
    };
}
