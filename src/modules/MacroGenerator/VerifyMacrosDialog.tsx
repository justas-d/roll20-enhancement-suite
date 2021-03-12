import { DialogBase } from "../../utils/DialogBase";
import { IGeneratedMacro, IMacroDiff } from "./IMacroGenerator";
import { Dialog, DialogHeader, DialogFooter, DialogFooterContent, DialogBody, CheckboxWithText } from "../../utils/DialogComponents";
import { DOM } from "../../utils/DOM";

export default class VerifyMacrosDialog extends DialogBase<null> {

    private modifiedMacros: IMacroDiff[];
    private addedMacros: IGeneratedMacro[];

    public show(modifiedMacros: IMacroDiff[], addedMacros: IGeneratedMacro[]) {
        this.addedMacros = addedMacros;
        this.modifiedMacros = modifiedMacros;
        super.internalShow();
    }

    public submit = (e: any) => {
        e.stopPropagation();

        // remove stuff from macro array.
        // might not be the best place to do it but eh
        $(this.getRoot()).find("input").each((_, input: any) => {
            if (input.checked) return;

            const name = input.getAttribute("data-name");
            const isModify = input.hasAttribute("data-modify") ;
            const pool: IGeneratedMacro[] = isModify
                ? this.modifiedMacros
                : this.addedMacros;

            const idx = pool.findIndex(e => e.name === name);
            if(idx === -1 ) {
                 console.error(`Tried to remove macro with name ${name} but could not find it's index in the pool. isModify: ${isModify}`);
                 return;
            }

            pool.splice(idx, 1);
        });

        this.close(true);
    }

    mkTable(title, head, body) {
        return (
            <div>
                <h3>{title}</h3>
                <table className="r20es-indent">
                    <thead>
                        <tr className="table-head">
                            {head}
                        </tr>
                    </thead>

                    <tbody>
                        {body}
                    </tbody>
                </table>
            </div>
        );
    }

    private generateAdded() {
        return this.mkTable("Macros To Be Added", [
            <th scope="col">Name</th>,
            <th scope="col">Action</th>
        ], this.addedMacros.map(obj =>
            <tr>
                <th scope="row">
                    <CheckboxWithText 
                        data-name={obj.name} 
                        value={obj.macro} 
                        checkboxText={obj.name} 
                        checked 
                    />
                </th>
                <td className="r20es-code" >{obj.macro}</td>
            </tr>
        ));
    }

    private generateModified() {
        return this.mkTable("Macros To Be Changed", [
            <th scope="col">Name</th>,
            <th scope="col">Old Action</th>,
            <th scope="col">New Action</th>,
        ], this.modifiedMacros.map(obj =>
            <tr>
                <th scope="row">
                    <CheckboxWithText
                        data-modify
                        data-name={obj.name}
                        value={obj.macro}
                        checkboxText={obj.name}
                        checked 
                        />
                </th>
                <td className="r20es-code">{obj.oldMacro}</td>
                <td className="r20es-code">{obj.macro}</td>
            </tr>
        ));

    }

    private onToggleAll = (e: any) => {
        e.stopPropagation();

        $(this.getRoot()).find("input").each((_: any, input: any) => {
            input.checked = !input.checked;
        });
        e.stopPropagation();
    }

    protected render(): HTMLElement {
        return (
            <Dialog>
                <DialogHeader>
                    <h2>Review Changes</h2>
                </DialogHeader>

                <DialogBody>
                    <button className="btn" onClick={this.onToggleAll}>Toggle All</button>
                    {this.addedMacros.length > 0 && this.generateAdded()}
                    {this.modifiedMacros.length > 0 && this.generateModified()}

                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button className="btn" onClick={this.close}>Close</button>
                        <button className="btn" style={{ float: "right" }} onClick={this.submit}>OK</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog> as any
        );
    }
}
