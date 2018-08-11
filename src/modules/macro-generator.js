import { R20Module } from "../tools/r20Module";
import { R20 } from "../tools/r20api";
import { OGL5eByRoll20MacroGenerator } from "../macro/OGL5eByRoll20.js";
import { DialogBase } from "../tools/dialogApi";
import { CheckboxWithText, DialogHeader, DialogBody, DialogFooter, Dialog, DialogFooterContent } from "../tools/dialogComponents";
import { createElementJsx } from "../tools/createElement";

const generateButtonId = "r20esgenerate"

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
        $(this.root).find("input").each((_, input) => {if(input.ignoreToggleAll) return; input.checked = !input.checked;});
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

                <hr/>

                <DialogBody>
                    <select value={this.activeGenerator ? this.activeGenerator.id : ""} onChange={this.onSelectChange}>
                        <option value="">Select a sheet</option>
                        {Object.values(this.generators).map(g => <option value={g.id}>{g.name}</option>)}
                    </select>

                    {checkboxDivs &&
                        <div style={{ paddingLeft: "12px", paddingBottom: "12px" }}>
                            <button onClick={this.onToggleAll}>Toggle All</button>
                            {checkboxDivs}
                            <hr/>
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
                        <button onClick={this.close}>Close</button>
                        <button disabled={!("elems" in data)} onClick={e => this.submit(e, checkboxes)}>OK</button>
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

                <hr/>

                <DialogBody>
                    <p>We found nothing to make a macro for.</p>
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button onClick={this.close}>OK</button>
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

        $(this.root).find("input").each((_, input) => {
            if (!input.checked) return;

            data.macros.push({
                name: input["data-name"],
                macro: input.value,
                modify: "data-modify" in input,
            });
        });

        this.setData(data);
        this.addedMacros = null;
        this.modifiedMacros = null;

        console.log("closing");
        this.close();
        e.stopPropagation();
    }

    generateTable(title, head, body) {
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
        return this.generateTable("Macros To Be Added", [
            <th scope="col">Name</th>,
            <th scope="col">Action</th>
        ], this.addedMacros.map(obj =>
            <tr>
                <th scope="row">
                    <CheckboxWithText data-name={obj.name} value={obj.macro} checkboxText={obj.name} checked />
                </th>
                <td>{obj.macro}</td>
            </tr>
        ));
    }

    generateModified() {
        return this.generateTable("Macros To Be Changed", [
            <th scope="col">Name</th>,
            <th scope="col">Old Action</th>,
            <th scope="col">New Action</th>,
        ], this.modifiedMacros.map(obj =>
            <tr>
                <th scope="row">
                    <CheckboxWithText data-modify data-name={obj.name} value={obj.macro} checkboxText={obj.name} checked />
                </th>
                <td>{obj.oldMacro}</td>
                <td>{obj.macro}</td>
            </tr>
        ));

    }

    onToggleAll(e) {
        $(this.root).find("input").each((_, input) => {input.checked = !input.checked;});
        e.stopPropagation();
    }

    render() {
        return (
            <Dialog>
                <DialogHeader>
                    <h2>Review Changes</h2>
                </DialogHeader>

                <hr/>

                <DialogBody>
                    <button onClick={this.onToggleAll}>Toggle All</button>
                    {this.addedMacros.length > 0 && this.generateAdded(this.addedMacros)}
                    {this.modifiedMacros.length > 0 && this.generateModified(this.addedMacros)}

                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button onClick={this.close}>Close</button>
                        <button onClick={this.submit}>OK</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>
        );
    }
}

class MacroGeneratorModule extends R20Module.SimpleBase {
    constructor(id) {
        super(id);
        this.generators = {};

        const addGen = gen => this.generators[gen.id] = gen;
        addGen(OGL5eByRoll20MacroGenerator);

        this.onButtonClick = this.onButtonClick.bind(this);
        this.onPickerDialogClose = this.onPickerDialogClose.bind(this);
        this.onVerifyDialogClose = this.onVerifyDialogClose.bind(this);
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

        data.sort((a,b) => a.name > b.name);

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
                if(elem.oldMacro === elem.macro) return;

                modified.push(elem);
            } else {
                added.push(elem);
            }
        });

        if (added.length <= 0 && modified.length <= 0) {
            this.noMacrosDialog.show();
        } else {
            this.verifyDialog.show(added, modified, dialogData);
        }
    }

    onVerifyDialogClose(e) {
        const data = this.verifyDialog.getData();
        const pc = this.activePc;
        this.activePc = null;

        if (!data) return;
        if (!pc) return;

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

                existing.save({ action: elem.macro, istokenaction: data.setIsTokenAction});
            } else {
                pc.abilities.create({
                    name: elem.name,
                    action: elem.macro,
                    istokenaction: data.setIsTokenAction
                });
            }
        }

        pc.view.render();
        e.stopPropagation();
    }

    onButtonClick(e) {
        e.stopPropagation();

        const attrib = "data-characterid";
        const elem = $(e.target.parentNode).find(`[${attrib}]`)[0];
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

    setup() {

        this.pickerDialog = new PickMacroGeneratorsDialog(this.generators);
        this.pickerDialog.root.addEventListener("close", this.onPickerDialogClose);

        this.verifyDialog = new VerifyMacrosDialog();
        this.verifyDialog.root.addEventListener("close", this.onVerifyDialogClose);

        this.noMacrosDialog = new NoMacrosDialog();

        window.r20es.macroGeneratorButtonClick = this.onButtonClick;


    }

    dispose() {
        
        window.r20es.macroGeneratorButtonClick = null;
        if(this.pickerDialog) this.pickerDialog.dispose();
        if(this.verifyDialog) this.verifyDialog.dispose();
        if(this.noMacrosDialog) this.noMacrosDialog.dispose();

    }
}

if (R20Module.canInstall()) new MacroGeneratorModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "macroGeneratorBase",
    name: "Character Sheet Ability Macro Generator",
    description: `Places a "Generate" button in the Attributes & Abilities Abilities that will open up the generate ability macros dialog. Only certain character sheets are supported. If you'd like to add your own sheet, submit a GitHub PR.`,
    category: R20Module.category.journal,

    mods: [
        {
            includes: "assets/app.js",
            find: `this.$el.on("click",".addabil"`,
            patch: `this.$el.on("click",".${generateButtonId}", (e) => {if(window.r20es && window.r20es.macroGeneratorButtonClick) window.r20es.macroGeneratorButtonClick(e)}), this.$el.on("click",".addabil"`
        },

        {
            includes: "/editor/",
            find: `<button class='btn addabil'>+ Add</button>`,
            patch: `<button class='btn ${generateButtonId}'>Generate</button><button class='btn addabil'>+ Add</button>`,
        }
    ]
});

export {
    hook as MacroGeneratorHook
}