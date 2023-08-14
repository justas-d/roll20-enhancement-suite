import {R20Module} from "../../utils/R20Module";
import {DOM} from "../../utils/DOM";
import {R20} from "../../utils/R20";
import {LoadingDialog} from "../../utils/DialogComponents";
import {SheetTab, SheetTabSheetInstanceData} from "../../utils/SheetTab";
import {replaceAll} from "../../utils/MiscUtils";
import {IGeneratedMacro, IMacroDiff, IMacroFactory, IMacroGenerator} from "./IMacroGenerator";
import OGL5eByRoll20 from "../../macro/OGL5eByRoll20";
import PF2ByRoll20 from "../../macro/PF2ByRoll20";
import DuplicateResolveDialog from "./DuplicateResolveDialog";
import VerifyMacrosDialog from "./VerifyMacrosDialog";
import NoMacrosDialog from "./NoMacrosDialog";
import lexCompare from "../../utils/LexicographicalComparator";
import {FolderingMethod} from "./FolderingMethod";
import {exhaustTypeSafe} from "../../utils/TypescriptUtils";
import { DialogBase } from "../../utils/DialogBase";
import { Dialog, DialogHeader, DialogFooter, DialogFooterContent, DialogBody, CheckboxWithText } from "../../utils/DialogComponents";

import {isChromium} from "../../utils/BrowserDetection";
import {copy} from "../../utils/MiscUtils";

class PickMacroGeneratorsDialog extends DialogBase<null> {
    private parent: MacroGeneratorModule;
    
    constructor(parent: MacroGeneratorModule) {
        super("r20es-big-dialog");
        this.parent = parent;
    }

    public show = this.internalShow;

    submit = (e: any, checkboxes: HTMLInputElement[]) =>  {
        this.parent.categoryFilter = checkboxes.reduce((accum, checkbox) => { accum[checkbox.value] = checkbox.checked; return accum; }, {});
        this.close(true);
        e.stopPropagation();
    }

    onTokenActionChecked = (e: any) => {
        this.parent.setIsTokenAction = e.target.checked;
        e.stopPropagation();
    }

    onSelectChange = (e: any) => {
        this.parent.activeGenerator = this.parent.generators[e.target.value];

        this.rerender();
        
        // dialog is not centered after rerendering on chrome
        if (isChromium()) {
            this.recenter();
        }

        e.stopPropagation();
    }

    generateCheckboxes() {
        let elems = [];
        let checkboxes = [];

        for(let factoryIndex = 0; factoryIndex < this.parent.activeGenerator.macroFactories.length; factoryIndex++) {
            const data = this.parent.activeGenerator.macroFactories[factoryIndex]

            const root = (
                <div>
                    <input style={{ verticalAlign: "middle", marginRight: "4px" }} type="checkbox" value={factoryIndex} checked/>
                    <span style={{ verticalAlign: "middle" }}>{data.name}</span>
                    { data.createFolderEntries &&
                        <span style={{float: "right", paddingRight: "16px", color: "#757575"}}>Folderable</span>
                    }
                </div>

            ) as any;

            elems.push(root);
            checkboxes.push(root.firstElementChild);
        }

        return { elems: elems, checkboxes: checkboxes };
    }

    onToggleAll = (e: any) => {
        $(this.getRoot()).find("input").each((_: any, input: any) => { 
            if (input["ignoreToggleAll"]) return; 
            input.checked = !input.checked; 
        });
        e.stopPropagation();
    };

    onChangeFolderStatus = (e: any) => {
        this.parent.folderingMethod = e.target.value;
    };

    public render(): HTMLElement {
        const data: any = this.parent.activeGenerator ? this.generateCheckboxes() : {};
        const checkboxDivs = data.elems;
        const checkboxes = data.checkboxes;

        const folderingOptions = [];
        {
            for(const key in FolderingMethod) {
                const val = FolderingMethod[key];
                folderingOptions.push(<option value={val}>{val}</option>)
            }
        }

        const selectionOptions = [];
        {
            for(const key in this.parent.generators) {
                const gen = this.parent.generators[key];
                selectionOptions.push(<option value={gen.id}>{gen.name}</option>)
            }
        }

        return (
            <Dialog>
                <DialogHeader>
                    <h2>Sheet, category selection.</h2>
                </DialogHeader>

                <DialogBody>
                    <select value={this.parent.activeGenerator ? this.parent.activeGenerator.id : ""} onChange={this.onSelectChange}>
                        <option value="">Select a sheet</option>
                        {selectionOptions}
                    </select>

                    {checkboxDivs &&
                        <div style={{ paddingLeft: "12px", paddingBottom: "12px" }}>
                            <button className="btn" onClick={this.onToggleAll}>Toggle All</button>
                            {checkboxDivs}
                            <hr />

                            <select value={this.parent.folderingMethod} onChange={this.onChangeFolderStatus}>
                                {folderingOptions}
                            </select>

                            <CheckboxWithText
                                ignoreToggleAll
                                checked={this.parent.setIsTokenAction}
                                onChange={this.onTokenActionChecked}
                                checkboxText="Show as Token Action"
                            />

                            <CheckboxWithText
                                ignoreToggleAll
                                checked={this.parent.sortLex}
                                onChange={(e) => this.parent.sortLex = e.target.checked}
                                checkboxText="Sort lexicographically"
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
            </Dialog> as any
        )
    }
}

class MacroGeneratorModule extends R20Module.SimpleBase {
    private pickerDialog: PickMacroGeneratorsDialog;
    private verifyDialog: VerifyMacrosDialog;
    private dupeDialog: DuplicateResolveDialog<IGeneratedMacro>;
    private noMacrosDialog: NoMacrosDialog;
    private sheetTab: any;

    public generators: { [id: string]: IMacroGenerator } = {};

    private activePc: Roll20.Character;
    public activeGenerator: IMacroGenerator;

    public setIsTokenAction: boolean = true;
    public sortLex: boolean = true;
    public folderingMethod: FolderingMethod = FolderingMethod.NoFolder;

    public categoryFilter: { [id: string]: boolean } = {};
    public byNameMacroTable: { [name: string]: IGeneratedMacro[] } = {};

    private macroBuffer: IGeneratedMacro[] = [];
    private modifiedMacros: IMacroDiff[] = [];
    private addedMacros: IGeneratedMacro[] = [];

    constructor() {
        super(__dirname);

        const addGen = gen => this.generators[gen.id] = gen;
        addGen(OGL5eByRoll20);
        addGen(PF2ByRoll20);
    }

    private showVerify() {

        const pc = this.activePc;

        const abilitiesByName = pc.abilities.models.reduce((accum, val) => {
            const name = val.get<string>("name");
            accum[name] = val;
            return accum;
        }, {} as { [id: string]: Roll20.CharacterAbility });

        this.macroBuffer.forEach(macro => {
            if (macro.name in abilitiesByName) {
                const oldMacro = abilitiesByName[macro.name].get<string>("action");

                if(oldMacro === macro.macro) return;

                this.modifiedMacros.push({
                    name: macro.name,
                    macro: macro.macro,
                    oldMacro,
                });
            } else {
                this.addedMacros.push(macro);
            }
        });

        if (this.modifiedMacros.length <= 0 && this.addedMacros.length <= 0) {
            this.noMacrosDialog.show();
        } else {
            this.verifyDialog.show(this.modifiedMacros, this.addedMacros);
        }
    }

    private onPickerDialogClose = (e: any) => {

        e.stopPropagation();

        if(!this.pickerDialog.isSuccessful()) return;
        if (!this.activePc) return;

        // generate an array of macros in wanted categories
        let data: IGeneratedMacro[] = [];

        const makeFolderHeader = (title: string= "") => `/w @{character_name} @{wtype} &{template:default}{{name=@{character_name} ${title}}} `;
        const getCategoryName = (factory: IMacroFactory) => factory.categoryNameModifier ? factory.categoryNameModifier(factory.name) : factory.name;

        let uberFolderBuffer = makeFolderHeader();
        let numUberFolderMacros = 0;

        for (let factoryId in this.activeGenerator.macroFactories) {
            if (!this.categoryFilter[factoryId]) continue;

            const factory = this.activeGenerator.macroFactories[factoryId];

            const doSmallFolder = this.folderingMethod === FolderingMethod.SmallFolders;
            const doUberFolder = this.folderingMethod === FolderingMethod.UberFolder;

            if((doSmallFolder || doUberFolder) && factory.createFolderEntries) {

                const folder = factory.createFolderEntries(this.activePc);

                if (folder.length <= 0) {
                    continue;
                }

                switch(this.folderingMethod) {
                    case FolderingMethod.NoFolder: break;
                    case FolderingMethod.SmallFolders: {
                        const name = getCategoryName(factory);

                        let buffer = makeFolderHeader(name);

                        for (const str of folder) {
                            buffer += `{{${str}}} `;
                        }

                        data.push({
                            name: factory.name,
                            macro: buffer
                        });
                        break;
                    }

                    case FolderingMethod.UberFolder: {
                        numUberFolderMacros += folder.length;

                        let buffer = "";

                        for (const str of folder) {
                            buffer += str;
                        }

                        const name = getCategoryName(factory);
                        uberFolderBuffer += `{{• ${name}=${buffer}}} `;

                        break;
                    }

                    default:
                        exhaustTypeSafe(this.folderingMethod);
                        break;
                }

            } else {
                const macros = factory.create(this.activePc);
                data = data.concat(macros);
            }
        }

        if(numUberFolderMacros > 0) {
            // @COPY-PASTE
            data.push({
                name: "Uber-Folder",
                macro: uberFolderBuffer
            })
        }

        // r20 forbids spaces in abilities
        for (let obj of data) {
            obj.name = replaceAll(obj.name, " ", "-");
        }

        // sort lexicographically
        if(this.sortLex) {
            data.sort((a, b) => lexCompare(a, b, (d) => d.name));
        }

        // make a by-name table
        for (const obj of data) {
            if (!(obj.name in this.byNameMacroTable)) this.byNameMacroTable[obj.name] = [];
            this.byNameMacroTable[obj.name].push(obj);
        }

        let hasDupes = false;
        for (const key in this.byNameMacroTable) {
            if (this.byNameMacroTable[key].length > 1) {
                hasDupes = true;
                break;
            }
        }

        const descRetriever = (data: IGeneratedMacro) => data.macro;

        if (hasDupes) {
            this.dupeDialog.show(this.byNameMacroTable, descRetriever);
        } else {
            this.macroBuffer = data;
            this.showVerify();
        }
    }

    private onVerifyDialogClose = (e: any) => {
      e.stopPropagation();

      if(!this.verifyDialog.isSuccessful()) return;

      this.generateMacros();
    }

    private onButtonClick = (e: any) => {
      e.stopPropagation();

console.log(e.target);
      const id = e.target.getAttribute("data-characterid");
      if(!id) {
        console.error("Failed to find character id for macro generation");
        return;
      }

      const pc = R20.getCharacter(id);
      if (!pc) {
        console.error(`Failed to get character for macro generation: getCharacter("${id}") failed.`);
        return;
      }

      this.activePc = pc;
      this.activeGenerator = null;
      this.categoryFilter = {};
      this.byNameMacroTable = {};
      this.macroBuffer = [];
      this.modifiedMacros = [];
      this.addedMacros = [];

      this.pickerDialog.show();
    }

    private renderSheet = (instance: SheetTabSheetInstanceData<null>) => {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <input
            type="button"
            style={{ 
              width: "50%", 
              height: "30px"
            }} 
            className="button" 
            onClick={this.onButtonClick}
            data-characterid={instance.characterId}
            value="Open Generate Macros Dialog"
          />
        </div>
      );
    }

    private onDupeDialogClose = (e: any) => {
        e.stopPropagation();

        if(!this.dupeDialog.isSuccessful()) return;

        const selectedButtonsTable = this.dupeDialog.getData();

        for (const key in this.byNameMacroTable) {
            const curMacros = this.byNameMacroTable[key];
            const selectedIndex = selectedButtonsTable[key];

            this.macroBuffer.push(curMacros[selectedIndex]);
        }

        this.showVerify();
    }

    private generateMacros() {
        const pc = this.activePc;
        if (!pc) return;

        let plsWait = new LoadingDialog("Generating");
        plsWait.show();

        // wait for plsWait to render.
        setTimeout(() => {
            try {
                for (let macro of this.modifiedMacros) {

                    const existing = pc.abilities.find(f => f.get("name") === macro.name);

                    if (!existing) {
                        console.error("Tried to modify existing ability but could not find it.");
                        console.table({
                            "Query": macro.name,
                            "Macro": macro.macro,
                            "Char Name": pc.get("name"),
                            "Char UUID": pc.get("id")
                        });

                        this.addedMacros.push(macro);
                        continue;
                    }

                    existing.save({
                        action: macro.macro,
                        istokenaction: this.setIsTokenAction,
                    });
                }

                for (let macro of this.addedMacros) {
                    pc.abilities.create({
                        name: macro.name,
                        action: macro.macro,
                        istokenaction: this.setIsTokenAction,
                    });
                }

                R20.rerender_character_sheet(pc);

            } catch (err) {
                console.error(err);
                R20.rerender_character_sheet(pc);
            }

            plsWait.dispose();
        }, 100);
    }

    public setup() {
        this.pickerDialog = new PickMacroGeneratorsDialog(this);
        this.pickerDialog.getRoot().addEventListener("close", this.onPickerDialogClose);

        this.verifyDialog = new VerifyMacrosDialog();
        this.verifyDialog.getRoot().addEventListener("close", this.onVerifyDialogClose);

        this.dupeDialog = new DuplicateResolveDialog();
        this.dupeDialog.getRoot().addEventListener("close", this.onDupeDialogClose);

        this.noMacrosDialog = new NoMacrosDialog();

        this.sheetTab = SheetTab.add("Macro Generator", this.renderSheet, null, R20.canEditCharacter);
    }

    public dispose() {
        if (this.sheetTab) this.sheetTab.dispose();

        if (this.pickerDialog) this.pickerDialog.dispose();
        if (this.verifyDialog) this.verifyDialog.dispose();
        if (this.dupeDialog) this.dupeDialog.dispose();
        if (this.noMacrosDialog) this.noMacrosDialog.dispose();

    }
}

export default () => {
  new MacroGeneratorModule().install();
};

