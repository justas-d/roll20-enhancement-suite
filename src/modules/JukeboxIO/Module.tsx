import { R20Module } from "../../utils/R20Module"
import { R20 } from "../../utils/R20";
import {IOModuleCommon} from "../IOModuleCommon";
import {IResult} from "../../utils/Result";
import {IApplyableJukeboxPlaylist, JukeboxIO} from "../../utils/JukeboxIO";
import { DOM } from "../../utils/DOM";

class JukeboxIOModule extends IOModuleCommon<IApplyableJukeboxPlaylist> {
  constructor() {
    super(__dirname, "r20es-jukebox-io-widget", "Import/Export Playlists", "Track", "Select Playlists", null);
  }

  continueImporting(finalData: IApplyableJukeboxPlaylist[]) {
    JukeboxIO.applyData(finalData);
  }

  nameGetter(d: IApplyableJukeboxPlaylist): string {
    return d.name;
  }

  descGetter(d: IApplyableJukeboxPlaylist): string {
    return d.songs.map(s => s.title).join(" ; ");
  }

  extra_drawing_above_table_import(): HTMLElement {
    return null;
  }

  getExportData(): IApplyableJukeboxPlaylist[] {
    return JukeboxIO.makeApplyablePlaylists(R20.getJukeboxPlaylists());
  }

  injectWidget(widget: HTMLElement) {
    const $before = $("#sortrootjukeboxalpha");
    const root = $before[0].parentNode;

    root.insertBefore(widget, $before[0]);
  }

  serializeExportData(finalData: IApplyableJukeboxPlaylist[]): { json: string; filename: string } {
    return {
      filename: "playlists.json",
      json: JukeboxIO.serialize(finalData)
    };
  }

  tryDeserialize(data: string): IResult<IApplyableJukeboxPlaylist[], string> {
    return JukeboxIO.deserialize(data);
  }
}

export default () => {
  new JukeboxIOModule().install();
};

