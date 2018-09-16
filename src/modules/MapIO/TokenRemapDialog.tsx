import {DialogBase} from "../../tools/DialogBase";
import {Dialog, DialogBody, DialogFooter, DialogFooterContent, DialogHeader} from "../../tools/DialogComponents";
import {DOM} from "../../tools/DOM";
import {ITokenRemapTables} from "../../tools/MapIO";
import * as Fuse from "fuse.js";

const PickerWidget = ({curValue}) => {
    return (
        <div>
            {curValue}
            <button>Search</button>
        </div>
    );
};

type MatchType = (input: string) => string[]

class AutoCompleteTextBox extends DOM.ElementBase {

    private matchFx: MatchType;
    private matches: string[] = [];

    public constructor(props) {
        super();
        this.matchFx = props.matcher;
    }

    private onChange = (e) => {
        this.matches = this.matchFx(e.target.value);
        this.rerender();
    };

    protected internalRender(): HTMLElement {
        return (
            <div className="r20es-autocomplete">
                <input type="text"
                       onChange={this.onChange}
                />

                <div>
                {this.matches.length > 0 &&
                    <div className="r20es-autocomplete-entries">
                        {this.matches.map(m => <div>{m}</div>)}
                    </div>
                }
                </div>

            </div>
        );
    }
}


export default class TokenRemapDialog extends DialogBase<null> {

    private fuse: any = new Fuse(["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"], {});

    public show(/*remap: ITokenRemapTables, callback: () => void*/) {
        this.internalShow();
    }

    private onOKClick = (e) => {
        e.stopPropagation();
    };

    private matcher = (query: string): string[] => {
        return this.fuse.search(query);
    };

    protected render(): HTMLElement {
        return (
            <Dialog>
                <DialogHeader>
                    <h2>Character Remapping</h2>
                </DialogHeader>

                <DialogBody>

                    <AutoCompleteTextBox matcher={this.matcher}/>

                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button value="Cancel" onClick={this.close}/>
                        <button value="OK" onClick={this.onOKClick}/>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog> as any
        );
    }
}
/*
        <table className="r20es-indent">
                        <thead>
                        <tr className="table-head">
                            <th scope="col">Imported Map Character Name</th>
                            <th scope="col">Existing Character Name</th>
                        </tr>
                        </thead>

                        <tbody>

                        </tbody>
                    </table>
 */