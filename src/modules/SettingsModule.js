import { R20Module } from "../tools/R20Module";
import { DOM } from "../tools/DOM";
import { findByIdAndRemove, getBrowser } from "../tools/MiscUtils";
import { DialogBase } from "../tools/DialogBase";
import { CheckboxWithText, DialogHeader, DialogBody, DialogFooter, Dialog, DialogFooterContent } from "../tools/DialogComponents";
import { R20Bootstrapper } from "../tools/R20Bootstrapper";
import { R20 } from "../tools/R20";

class ConfigEditBase extends DOM.ElementBase {
    constructor(props) {
        super(props);
        this.hook = props.hook;
        this.configName = props.configName;
        this.configView = this.hook.configView[this.configName];
    }

    setValue(val) {
        this.hook.config[this.configName] = val;
        this.hook.saveConfig();
    }

    getValue = _ => this.hook.config[this.configName];
}

class StringEdit extends ConfigEditBase {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        e.stopPropagation();
        this.setValue(e.target.value);
    }

    render() {
        return <input className="compact" type="text" onChange={this.onChange} value={this.getValue() || ""} />
    }
};

class DropdownEdit extends ConfigEditBase {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        e.stopPropagation();
        this.setValue(e.target.value);
    }

    render() {

        const vals = [];

        for (const key in this.configView.dropdownValues) {
            const val = this.configView.dropdownValues[key];

            vals.push(<option value={key}>{val}</option>);
        }
        return (
            <select className="compact" onChange={this.onChange} value={this.getValue()}>
                {vals}
            </select>
        );
    }
}

class CheckboxEdit extends ConfigEditBase {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        e.stopPropagation();
        console.log(e.target);
        console.log(e.target.checked);
        this.setValue(e.target.checked);
    }

    render() {
        return <input checked={this.getValue()} type="checkbox" className="r20es-checkbox" onChange={this.onChange} />
    }
}

class HookConfig extends DOM.ElementBase {

    constructor(props) {
        super(props);

        this.hook = props.hook;
    }

    render() {

        const elemMap = {
            "string": StringEdit,
            "dropdown": DropdownEdit,
            "checkbox": CheckboxEdit
        };

        let elems = [];

        if (this.hook.configView) {
            for (let cfgId in this.hook.configView) {
                const cfg = this.hook.configView[cfgId];
                if (!(cfg.type in elemMap)) {
                    alert(`Unknown config type: ${cfg.type}`);
                    continue;
                }

                const Component = elemMap[cfg.type];
                elems.push(
                    <li>
                        <Component configName={cfgId} hook={this.hook} />
                        <span title={cfgId} className="text">{cfg.display}</span>
                    </li>

                );
            }
        }

        return (
            <div className="more-settings">

                <h3 title={this.hook.id + " " + this.hook.filename}>{this.hook.name}</h3>
                <hr />

                <section className="r20es-indent description">
                    <p>{this.hook.description}</p>
                    
                    {this.hook.gmOnly &&
                        <p>This module is only usable by GMs (which you are)</p>
                    }
                </section>

                <h3>Options</h3>
                <hr />

                <ul className="r20es-indent">
                    {elems}
                </ul>
            </div>
        );
    }
}

class HookHeader extends DOM.ElementBase {
    constructor(props) {
        super(props);

        this.hook = props.hook;
        this.onSelect = props.onSelect;
        this.selected = props.selected;

        this.showConfig = false;
        this.onClick = this.onClick.bind(this);
        this.onCheckboxChange = this.onCheckboxChange.bind(this);

    }

    onClick(e) {
        e.stopPropagation();

        if (e.target.tagName.toLowerCase() === "input") return; // ignore if clicked on the checkbox

        this.onSelect(this.hook);
    }

    onCheckboxChange(e) {
        e.stopPropagation();

        const mod = R20Module.getModule(this.hook.filename);
        console.log(mod);
        mod.toggleEnabledState();
    }

    render() {
        let style = {};
        const isDisabled = !R20.isGM() && this.hook.gmOnly;
        
        console.log(isDisabled);
        
        if(isDisabled) {
            style.color = "rgb(200,200,200)";
        }
        
        if(this.selected) {
            style.backgroundColor = "rgb(240,240,240)";
        }

        return (
            <div>
                <div style={style} className="r20es-clickable-text" onClick={this.onClick} title={isDisabled ? "This module is GM only." : ""}>
                    <input onChange={this.onCheckboxChange} checked={this.hook.config.enabled} type="checkbox" />
                    <span className="text">{this.hook.name}</span>
                </div>
            </div>
        );
    }
}


function mapObj(obj, fx) {
    return Object.keys(obj).reduce((accum, curVal) => {
        let val = fx(obj[curVal], curVal);

        if (val !== undefined && val !== null) {
            accum.push(val);
        }

        return accum;
    }, []);
}

class SettingsDialog extends DialogBase {
    constructor(hooks) {
        super("r20es-settings-dialog");
        this.hooks = hooks;

        this.activeModule = null;
        this.onSelect = this.onSelect.bind(this);
        this.prevModuleElem = null;
    }

    onSelect(selectedModule) {
        this.activeModule = _.isEqual(this.activeModule, selectedModule) ? null : selectedModule;
        this.rerender();
    }

    render() {

        let byCategory = {};

        for (let key in this.hooks) {
            let hook = this.hooks[key];
            if (hook.force) continue;

            if (!(hook.category in byCategory))
                byCategory[hook.category] = [];

            byCategory[hook.category].push(key);
        }


        return (
            <Dialog>
                <DialogHeader>
                    <h2>Roll20 Enhancement Suite Settings</h2>
                </DialogHeader>
                <hr />

                <DialogBody>
                    <div className="left">
                        {mapObj(byCategory, (bucket, categoryName) =>
                            <div>
                                <h3>{categoryName}</h3>
                                <div className="r20es-indent">
                                    {bucket.map(id =>
                                        <HookHeader
                                            selected={this.activeModule && this.activeModule.id === id}
                                            onSelect={this.onSelect}
                                            hook={this.hooks[id]}
                                        />)
                                    }
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="r20es-indent right">
                        {this.activeModule
                            ? <HookConfig hook={this.activeModule} />
                            : <p>Select a module from the left to see it's description and options.</p>
                        }
                    </div>

                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <input type="button" onClick={this.close} value="Close" />
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>

        );
    }
}

class SettingsModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__filename);
        this.buttonId = "r20es-settings-button";
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    onButtonClick(e) {
        e.stopPropagation();
        this.dialog.show();
    }

    setup() {
        this.dialog = new SettingsDialog(this.getAllHooks());

        const adjacent = document.getElementById("exitroll20game");

        const button = <input
            type="button"
            style={{ marginBottom: "8px", width: "calc(100% - 21px)" }}
            id={this.buttonId}
            className="btn"
            value="R20ES Settings"
            onClick={this.onButtonClick}
        />;

        adjacent.parentNode.parentNode.insertBefore(button, adjacent.parentNode);

        this.dialog.show();
    }

    dispose() {
        findByIdAndRemove(this.buttonId);
        if (this.dialog) this.dialog.dispose();
    }
}

if (R20Module.canInstall()) new SettingsModule().install();

class SettingsBootstrapper extends R20Bootstrapper.Base {
    constructor() {
        super(__filename);
        this.cssId = "r20es-settings-css";
    }

    setup() {
        this.injectCSS(getBrowser().runtime.getURL("settings.css"), document.head, this.cssId);

    }

    disposePrevious() {
        findByIdAndRemove(this.cssId);
    }
}

const hook = R20Module.makeHook(__filename, {
    id: "pluginSettings",
    force: true,
});

export {
    hook as SettingsHook,
    SettingsBootstrapper
}
