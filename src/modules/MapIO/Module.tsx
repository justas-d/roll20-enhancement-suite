import { R20Module } from "../../tools/R20Module"
import { DOM, SidebarSeparator, SidebarCategoryTitle } from '../../tools/DOM'
import { findByIdAndRemove, readFile } from "../../tools/MiscUtils";
import { R20 } from "../../tools/R20";
import { saveAs } from 'save-as'
import PickObjectsDialog from "../PickObjectsDialog";
import {IApplyableMapData, MapIO} from "../../tools/MapIO";
import TokenRemapDialog from "./TokenRemapDialog";

// @COPYPASTED from MacroIO
class MapIOModule extends R20Module.OnAppLoadBase {
    readonly widgetId = "r20es-map-io-widget";
    private pickMapsDialog: PickObjectsDialog<IApplyableMapData>;
    private remapDialog: TokenRemapDialog;
    private mapBuffer: IApplyableMapData[];

    constructor() {
        super(__dirname);
    }

    private onFileChange(e: any) {

        e.stopPropagation();
        const targ = e.target;
        
        ($(targ.parentNode).find("button.import")[0] as any).disabled = targ.files.length <= 0;
    }

    private showPickMapsDialog(continueCallback: (maps: IApplyableMapData[]) => void) {
        this.pickMapsDialog.show("Select Maps", 
            this.mapBuffer, 
            (d) => d.attributes.name, 
            (d) => d.attributes.thumbnail, 
            continueCallback);
    }

    private onImportClick = (e: any) => {
        e.stopPropagation();
        
        const fs = $((e.target).parentNode.parentNode).find("input[type='file']")[0];

        const file = fs.files[0];
        fs.value = "";
        (e.target as any).disabled = true;

        readFile(file)
            .then((payload: string) => {
                const result = MapIO.deserialize(payload);
                if(result.isErr()) throw new Error(result.err().unwrap());

                const data = result.ok().unwrap();
                this.mapBuffer = result.ok().unwrap();
                this.showPickMapsDialog((finalData: IApplyableMapData[]) => {

                    const remap = MapIO.generateRemapTable(finalData);
                    console.log(remap);

                    //MapIO.applyToCampaign(finalData, remap);
                });
            })
            .catch(alert);
    };

    private onExportClick = (e: any) => {
        e.stopPropagation();

        const maps= MapIO.prepareMapData(window.d20.Campaign.pages.models);

        if(maps.length <= 0) {
            alert("No maps found.");
            return;
        }

        this.mapBuffer = maps;
        this.showPickMapsDialog(this.continueExporting);
    }

    private continueExporting(maps: IApplyableMapData[]) {
        const result = MapIO.serialize(maps);

        const jsonBlob = new Blob([result], { type: 'data:application/json;charset=utf-8' });
        const fileName = maps.map(m => m.attributes.name.replace(" ", ".")).join("_") + ".json";
        saveAs(jsonBlob, fileName);
    }

    public setup() {
        this.pickMapsDialog= new PickObjectsDialog<IApplyableMapData>();
        this.remapDialog = new TokenRemapDialog();
        this.remapDialog.show();
        
        const root = $("#deckstables")[0].firstElementChild;
        const nextTo = $("#deckstables").find("#addmacro")[0];

        const widget = (
            <div id={this.widgetId}>
                <div>
                    <SidebarCategoryTitle>
                        Import/Export Maps
                </SidebarCategoryTitle>

                    <input
                        type="file"
                        style={{ width: "95%" }}
                        onChange={this.onFileChange}
                    />

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button disabled className="import btn" style={{ marginRight: "8px", width: "100%" }} onClick={this.onImportClick}>
                            Import
                    </button>

                        <button className="btn" style={{ width: "100%" }} onClick={this.onExportClick}>
                            Export
                    </button>
                    </div>

                </div>

                <SidebarSeparator big="1px" />
            </div>
        );

        root.insertBefore(widget, nextTo);
    }

    public dispose() {
        if(this.remapDialog ) this.remapDialog .dispose();
        if(this.pickMapsDialog) this.pickMapsDialog.dispose();

        findByIdAndRemove(this.widgetId);
        super.dispose();
    }
}

if (R20Module.canInstall()) new MapIOModule().install();
