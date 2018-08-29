import { R20Module } from "../../tools/R20Module";
import { R20 } from "../../tools/R20";
import { OGL5eByRoll20MacroGenerator } from "../../macro/OGL5eByRoll20";
import { DialogBase } from "../../tools/DialogBase";
import { CheckboxWithText, DialogHeader, DialogBody, DialogFooter, Dialog, DialogFooterContent, LoadingDialog } from "../../tools/DialogComponents";
import { DOM } from "../../tools/DOM";
import { SheetTab } from "../../tools/SheetTab";
import { replaceAll, mapObj, isChrome } from "../../tools/MiscUtils";

class PickMacroGeneratorsDialog extends DialogBase {
    constructor(generators) {
        super();
        this.generators = generators;

        this.onSelectChange = this.onSelectChange.bind(this);
        this.onTokenActionChecked = this.onTokenActionChecked.bind(this);
        this.onToggleAll = this.onToggleAll.bind(this);

        this.setIsTokenAction = true;
        this.activeGenerator = null;
    }

    submit(e, checkboxes) {
        const checked = checkboxes.reduce((accum, checkbox) => { accum[checkbox.value] = checkbox.checked; return accum; }, {});
        this.setData({
            generator: this.activeGenerator,
            checked: checked,
            setIsTokenAction: this.setIsTokenAction,
        });
        this.close();
        e.stopPropagation();
    }

    onTokenActionChecked(e) {
        this.setIsTokenAction = e.target.checked;
        e.stopPropagation();
    }

    onSelectChange(e) {
        this.activeGenerator = this.generators[e.target.value];

        this.rerender();
        
        // dialog is not centered after rerendering on chrome
        if (isChrome()) {
            this.recenter();
        }

        e.stopPropagation();
    }

    generateCheckboxes() {
        let elems = [];
        let checkboxes = [];

        for (const type in this.activeGenerator.actionTypes) {
            const name = this.activeGenerator.actionTypes[type];

            const root = <CheckboxWithText value={type} checkboxText={name} checked />
            elems.push(root);
            checkboxes.push(root.firstElementChild);
        }

        return { elems: elems, checkboxes: checkboxes };
    }

    onToggleAll(e) {
        $(this.getRoot()).find("input").each((_, input) => { if (input.ignoreToggleAll) return; input.checked = !input.checked; });
        e.stopPropagation();
    }

    render() {
        const data = this.activeGenerator ? this.generateCheckboxes() : {};
        const checkboxDivs = data.elems;
        const checkboxes = data.checkboxes;

        return (
            <Dialog>
                <DialogHeader>
                    <h2>Sheet, category selection.</h2>
                </DialogHeader>

                <hr />

                <DialogBody>
                    <select value={this.activeGenerator ? this.activeGenerator.id : ""} onChange={this.onSelectChange}>
                        <option value="">Select a sheet</option>
                        {Object.values(this.generators).map(g => <option value={g.id}>{g.name}</option>)}
                    </select>

                    {checkboxDivs &&
                        <div style={{ paddingLeft: "12px", paddingBottom: "12px" }}>
                            <button className="btn" onClick={this.onToggleAll}>Toggle All</button>
                            {checkboxDivs}
                            <hr />
                            <CheckboxWithText
                                ignoreToggleAll
                                checked={this.setIsTokenAction}
                                onChecked={this.onTokenActionChecked}
                                checkboxText={"Show as Token Action"}
                            />
                        </div>

                    }
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button className="btn" onClick={this.close}>Close</button>
                        <button className="btn" style={{ float: "right" }} disabled={!("elems" in data)} onClick={e => this.submit(e, checkboxes)}>OK</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>
        )
    }
}

class NoMacrosDialog extends DialogBase {
    render() {
        return (
            <Dialog>
                <DialogHeader>
                    <h2>Notice</h2>
                </DialogHeader>

                <hr />

                <DialogBody>
                    <p>We found nothing to make a macro for.</p>
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button style={{ boxSizing: "border-box", width: "100%" }} className="btn" onClick={this.close}>OK</button>
                    </DialogFooterContent>
                </DialogFooter>

            </Dialog>
        )
    }
}

class VerifyMacrosDialog extends DialogBase {
    constructor() {
        super();
        this.submit = this.submit.bind(this);
        this.onToggleAll = this.onToggleAll.bind(this);
    }

    show(addedMacros, modifiedMacros, other) {
        this.addedMacros = addedMacros;
        this.modifiedMacros = modifiedMacros;
        this.otherData = other;

        super.show();
    }
    submit(e) {

        let data = {
            macros: [],
            setIsTokenAction: this.otherData.setIsTokenAction,
        };

        $(this.getRoot()).find("input").each((_, input) => {
            if (!input.checked) return;

            data.macros.push({
                name: input.getAttribute("data-name"),
                macro: input.value,
                modify: input.hasAttribute("data-modify"),
            });
        });

        this.setData(data);
        this.addedMacros = null;
        this.modifiedMacros = null;

        this.close();
        e.stopPropagation();
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

    generateAdded() {
        return this.mkTable("Macros To Be Added", [
            <th scope="col">Name</th>,
            <th scope="col">Action</th>
        ], this.addedMacros.map(obj =>
            <tr>
                <th scope="row">
                    <CheckboxWithText data-name={obj.name} value={obj.macro} checkboxText={obj.name} checked />
                </th>
                <td className="r20es-code" >{obj.macro}</td>
            </tr>
        ));
    }

    generateModified() {
        return this.mkTable("Macros To Be Changed", [
            <th scope="col">Name</th>,
            <th scope="col">Old Action</th>,
            <th scope="col">New Action</th>,
        ], this.modifiedMacros.map(obj =>
            <tr>
                <th scope="row">
                    <CheckboxWithText data-modify data-name={obj.name} value={obj.macro} checkboxText={obj.name} checked />
                </th>
                <td className="r20es-code">{obj.oldMacro}</td>
                <td className="r20es-code">{obj.macro}</td>
            </tr>
        ));

    }

    onToggleAll(e) {
        $(this.getRoot()).find("input").each((_, input) => { input.checked = !input.checked; });
        e.stopPropagation();
    }

    render() {
        return (
            <Dialog>
                <DialogHeader>
                    <h2>Review Changes</h2>
                </DialogHeader>

                <hr />

                <DialogBody>
                    <button className="btn" onClick={this.onToggleAll}>Toggle All</button>
                    {this.addedMacros.length > 0 && this.generateAdded(this.addedMacros)}
                    {this.modifiedMacros.length > 0 && this.generateModified(this.addedMacros)}

                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button className="btn" onClick={this.close}>Close</button>
                        <button className="btn" style={{ float: "right" }} onClick={this.submit}>OK</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>
        );
    }
}

class DuplicateResolveDialog extends DialogBase {
    constructor() {
        super();

        this.submit = this.submit.bind(this);
        this.checkboxCheck = this.checkboxCheck.bind(this);
        this.onTextClick = this.onTextClick.bind(this);
    }

    show(data, _dupes) {

        this.data = data;
        this.dupes = mapObj(_dupes, (objs, name) => {
            return {
                name,
                objs,
                selectedIndex: 0
            };
        });

        super.show();
    }

    submit() {
        // remove dupes from data
        let idx = this.data.length;
        while (idx-- > 0) {
            const cur = this.data[idx];

            if (this.dupes.find(e => e.name === cur.name)) {
                this.data.splice(idx, 1);
            }
        }

        // insert resolved dupes
        for (const data of this.dupes) {
            const obj = data.objs[data.selectedIndex];
            this.data.push({
                modify: obj.modify,
                name: data.name,
                macro: obj.macro
            });
        }

        this.setData(this.data);
        this.close();
    }

    checkboxLogic(target) {
        const dataIndex = parseInt(target.getAttribute("data-data-index"));
        const objIndex = parseInt(target.getAttribute("data-obj-index"));

        const data = this.dupes[dataIndex];
        data.selectedIndex = objIndex;

        this.rerender();
    }

    checkboxCheck(e) {
        this.checkboxLogic(e.target);
    }

    onTextClick(e) {
        const cb = $(e.target).find("input[data-data-index]")[0];
        if (!cb) return;

        this.checkboxLogic(cb);
    }

    genDiffs() {
        let diffs = [];

        for (let dataIndex = 0; dataIndex < this.dupes.length; dataIndex++) {
            const data = this.dupes[dataIndex];

            const divs = [];
            for (let objIndex = 0; objIndex < data.objs.length; objIndex++) {
                const obj = data.objs[objIndex];
                divs.push(

                    <div style={{ paddingTop: "0px", paddingBottom: "0px" }} onClick={this.onTextClick} className="r20es-code">
                        <input
                            className="btn"
                            style={{ verticalAlign: "middle", marginRight: "4px" }}
                            data-data-index={dataIndex}
                            data-obj-index={objIndex}
                            onChange={this.checkboxCheck}
                            type="radio"
                            checked={data.selectedIndex === objIndex}
                        />
                        {obj.macro}
                    </div>
                );
            }

            diffs.push(
                <div>
                    <h4>{data.name}</h4>
                    {divs}
                    <hr />
                </div>
            );
        }

        return diffs;

    }

    render() {
        return (
            <Dialog>
                <DialogHeader>
                    <h2>Duplicates</h2>
                </DialogHeader>

                <hr />

                <DialogBody>
                    <p>Abilities with duplicate names were generated.</p>
                    <p>Choose which duplicate ability should be kept.</p>
                </DialogBody>

                <hr />

                <DialogBody>
                    {this.genDiffs()}
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button style={{ boxSizing: "border-box", width: "100%" }} className="btn" onClick={this.submit}>Done</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>
        );
    }
}

class MacroGeneratorModule extends R20Module.SimpleBase {
    constructor() {
        super(__dirname);
        this.generators = {};

        const addGen = gen => this.generators[gen.id] = gen;
        addGen(OGL5eByRoll20MacroGenerator);

        this.onButtonClick = this.onButtonClick.bind(this);
        this.onPickerDialogClose = this.onPickerDialogClose.bind(this);
        this.onVerifyDialogClose = this.onVerifyDialogClose.bind(this);
        this.onDupeDialogClose = this.onDupeDialogClose.bind(this);
        this.renderSheet = this.renderSheet.bind(this);
    }

    genAddedAndModAndShowVerify(data) {

        const pc = this.activePc;


        let added = [];
        let modified = [];

        const existingNames = pc.abilities.models.reduce((accum, val) => {
            const name = val.get("name");
            accum[name] = val;
            return accum;
        }, {});

        data.forEach(elem => {
            if (elem.name in existingNames) {
                elem.oldMacro = existingNames[elem.name].get("action");
                if (elem.oldMacro === elem.macro) return;

                modified.push(elem);
            } else {
                added.push(elem);
            }
        });

        console.log(added);
        console.log(modified);
        console.log(data);

        if (added.length <= 0 && modified.length <= 0) {
            this.noMacrosDialog.show();
        } else {
            this.verifyDialog.show(added, modified, data);
        }
    }

    onPickerDialogClose(e) {

        e.stopPropagation();

        const dialogData = this.pickerDialog.getData();
        if (!dialogData) return;
        if (!this.activePc) return;

        const generator = dialogData.generator;
        const checked = dialogData.checked;
        const pc = this.activePc;

        let data = [];

        for (let factoryId in generator.macroFactories) {
            if (!checked[factoryId]) continue;

            const factory = generator.macroFactories[factoryId];
            data = data.concat(factory(pc));
        }

        // r20 forbids spaces in abilities
        for (let obj of data) {
            obj.name = replaceAll(obj.name, " ", "-");
        }

        data.sort((a, b) => a.name > b.name);

        const names = {};
        const duplicateLists = {};
        let hasDupes = false;

        // populate duplicateLists
        for (const obj of data) {
            if (obj.name in names) {
                hasDupes = true;
                duplicateLists[obj.name] = duplicateLists[obj.name] || [];
                const list = duplicateLists[obj.name]
                const prev = names[obj.name];

                list.push(obj);
                if (prev !== null) {
                    list.push(prev);
                    names[obj.name] = null;
                }

            } else {
                names[obj.name] = obj;
            }
        }

        if (hasDupes) {
            this.dupeDialog.show(data, duplicateLists);
        } else {
            this.genAddedAndModAndShowVerify(data);
        }
    }

    onVerifyDialogClose(e) {
        e.stopPropagation();

        const data = this.verifyDialog.getData();
        this.generateMacros(data);
    }

    onButtonClick(e) {
        e.stopPropagation();

        const attrib = "data-characterid";
        const elem = $(e.target).closest(`[${attrib}]`)[0];
        if (!elem) {
            console.error("Failed to find character id for macro generation");
            return;
        }

        const id = elem.getAttribute(attrib);
        const pc = R20.getCharacter(id);
        if (!pc) {
            console.error(`Failed to get character for macro generation: getCharacter("${id}") failed.`);
            return;
        }

        this.activePc = pc;
        this.pickerDialog.show();
    }

    renderSheet() {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <button style={{ width: "50%", height: "30px", display: "flex", justifyContent: "center" }} className="btn" onClick={this.onButtonClick}>
                    Open Generate Macros Dialog
            </button>
            </div>
        );
    }

    onDupeDialogClose(e) {
        e.stopPropagation();

        const data = this.dupeDialog.getData();
        this.genAddedAndModAndShowVerify(data);
    }

    generateMacros(data) {
        const pc = this.activePc;
        this.activePc = null;

        if (!data) return;
        if (!pc) return;

        let plsWait = new LoadingDialog("Generating");
        plsWait.show();

        // wait for plsWait to render.
        setTimeout(() => {
            try {
                for (let elem of data.macros) {
                    if (elem.modify) {
                        const existing = pc.abilities.find(f => f.get("name") === elem.name);
                        if (!existing) {
                            console.error("Tried to modify existing ability but could not find it.");
                            console.table({
                                "Query": elem.name,
                                "Macro": elem.macro,
                                "Char Name": pc.get("name"),
                                "Char UUID": pc.get("id")
                            });
                            continue;
                        }

                        existing.save({
                            action: elem.macro,
                            istokenaction: data.setIsTokenAction
                        });
                    } else {
                        pc.abilities.create({
                            name: elem.name,
                            action: elem.macro,
                            istokenaction: data.setIsTokenAction
                        });
                    }
                }

                pc.view.render();
            } catch (err) {
                console.error(err);
            }

            plsWait.dispose();
        }, 100);
    }

    setup() {


        this.pickerDialog = new PickMacroGeneratorsDialog(this.generators);
        this.pickerDialog.getRoot().addEventListener("close", this.onPickerDialogClose);

        this.verifyDialog = new VerifyMacrosDialog();
        this.verifyDialog.getRoot().addEventListener("close", this.onVerifyDialogClose);

        this.dupeDialog = new DuplicateResolveDialog();
        this.dupeDialog.getRoot().addEventListener("close", this.onDupeDialogClose);

        this.noMacrosDialog = new NoMacrosDialog();

        this.sheetTab = SheetTab.add("Macro Generator", this.renderSheet);
    }

    dispose() {
        if (this.sheetTab) this.sheetTab.dispose();

        window.r20es.macroGeneratorButtonClick = null;
        if (this.pickerDialog) this.pickerDialog.dispose();
        if (this.verifyDialog) this.verifyDialog.dispose();
        if (this.dupeDialog) this.dupeDialog.dispose();
        if (this.noMacrosDialog) this.noMacrosDialog.dispose();

    }
}

if (R20Module.canInstall()) new MacroGeneratorModule().install()
