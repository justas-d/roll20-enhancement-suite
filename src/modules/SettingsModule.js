import { R20Module } from "../tools/R20Module";
import { DOM } from "../tools/DOM";
import { findByIdAndRemove, getBrowser, strIsNullOrEmpty, mapObj, getExtUrlFromPage } from "../tools/MiscUtils";
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
        const oldVal = this.hook.config[this.configName];

        this.hook.config[this.configName] = val;
        this.hook.saveConfig();

        const mod = R20Module.getModule(this.hook.filename);
        if ("onSettingChange" in mod && typeof (mod.onSettingChange) === "function") {
            mod.onSettingChange(this.configName, oldVal, val);
        }
    }

    getValue = _ => this.hook.config[this.configName];

    getConfigView = _ => this.hook.configView[this.configName];
}

class ColorEdit extends ConfigEditBase {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        e.stopPropagation();
        const val = e.target.value;
        const newCols = [
            parseInt(val.charAt(1) + val.charAt(2), 16),
            parseInt(val.charAt(3) + val.charAt(4), 16),
            parseInt(val.charAt(5) + val.charAt(6), 16),
        ];

        this.setValue(newCols);
    }

    internalRender() {
        const cols = this.getValue();
        const val = `#${cols[0].toString(16)}${cols[1].toString(16)}${cols[2].toString(16)}`;

        return (
            <input onChange={this.onChange}
                type="color"
                className="compact"
                value={val}
            />
        )
    }
}

class NumberEdit extends ConfigEditBase {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        e.stopPropagation();
        this.setValue(parseFloat(e.target.value));
    }

    internalRender() {
        const val = (
            <input onChange={this.onChange}
                className="compact"
                type="number"
                value={this.getValue()}
            />
        );
        const min = this.getConfigView().numberMin;
        const max = this.getConfigView().numberMax;

        if (min !== undefined) val.min = min;
        if (max !== undefined) val.max = max;

        return val;
    }
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

    internalRender() {
        return <input className="compact" type="text" onChange={this.onChange} value={this.getValue() || ""} />
    }
};

class SliderEdit extends ConfigEditBase {
    constructor(props) {
        super(props);
    }

    onChange = (e) => {
        e.stopPropagation();
        const val = parseFloat(e.target.value);
        this.setValue(val);

        $(e.target.parentNode).find("input")[0].title = val.toString();
    }

    internalRender() {
        const min = this.getConfigView().sliderMin;
        const max = this.getConfigView().sliderMax;
        const val = this.getValue();
        
        return (
            <section className="compact">

                <span>{min}</span>
                <input onChange={this.onChange}
                    style={{ height: "auto", width: "80%", margin: "0 8px 0 8px", border: "none" }}
                    type="range"
                    min={min}
                    max={max}
                    step="any"
                    value={val}
                    title={val}
                />
                <span>{max}</span>

            </section>
        );
    }
}

class DropdownEdit extends ConfigEditBase {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        e.stopPropagation();
        this.setValue(e.target.value);
    }

    internalRender() {

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
        this.setValue(e.target.checked);
    }

    internalRender() {
        return (
            <input onChange={this.onChange}
                checked={this.getValue()}
                type="checkbox"
                className="r20es-checkbox"
            />
        );
    }
}

class HookConfig extends DOM.ElementBase {

    constructor(props) {
        super(props);

        this.hook = props.hook;
    }

    internalRender() {

        const elemMap = {
            "string": StringEdit,
            "dropdown": DropdownEdit,
            "checkbox": CheckboxEdit,
            "slider": SliderEdit,
            "number": NumberEdit,
            "color": ColorEdit
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
                    <li style={{ display: "flex", justifyContent: "space-between" }}>
                        <span title={cfgId} className="text">{cfg.display}</span>
                        <Component configName={cfgId} hook={this.hook} />
                    </li>

                );
            }
        }

        return (
            <div className="more-settings">

                {!strIsNullOrEmpty(this.hook.description) &&
                    <section>
                        <h3 title={this.hook.id + " " + this.hook.filename}>{this.hook.name}</h3>
                        <hr />
                        <section className="r20es-indent description">
                            <p>{this.hook.description}</p>

                            {this.hook.gmOnly &&
                                <p>This module is only usable by GMs (which you {R20.isGM() ? "are" : "aren't"})</p>
                            }
                        </section>
                    </section>
                }

                {elems.length > 0 &&
                    <section>
                        <h3>Options</h3>
                        <hr />

                        <ul className="r20es-indent">
                            {elems}
                        </ul>
                    </section>
                }
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
        mod.toggleEnabledState();
    }

    internalRender() {
        let style = {};
        const isDisabled = !R20.isGM() && this.hook.gmOnly;

        if (isDisabled) {
            style.color = "rgb(200,200,200)";
        }

        if (this.selected) {
            style.backgroundColor = "rgb(240,240,240)";
        }

        return (
            <div>
                <div style={style} className="r20es-clickable-text" onClick={this.onClick} title={isDisabled ? "This module is GM only." : ""}>
                    {!this.hook.force &&
                        <input onChange={this.onCheckboxChange} checked={this.hook.config.enabled} type="checkbox" />
                    }
                    <span className="text">{this.hook.name}</span>
                </div>
            </div>
        );
    }
}

class AboutDialog extends DialogBase {
    constructor() {
        super(null, null, true); // recenter workaround
        this.githubUrl = "https://github.com/SSStormy/roll20-enhancement-suite/";
        this.openGithub = this.openGithub.bind(this);

        getExtUrlFromPage("logo.svg", 5000)
            .then(url => this.logoUrl = url)
            .catch(err => console.error(`Failed to get logo.svg: ${err}`));
    }

    openGithub() {
        var redir = window.open(this.githubUrl, "_blank");
        redir.location;
    }

    render() {
        const mkEntry = (what, data) =>
            <div>
                {what}
                <span style={{ float: "right" }}>{data}</span>
            </div>

        return (
            <Dialog>
                <DialogHeader style={{ textAlign: "center" }}>
                    <h1>Roll20 Enhancement Suite</h1>
                    <h2>Version {R20ES_VERSION}</h2>
                    <h3>Built for {R20ES_BROWSER}</h3>
                </DialogHeader>


                <DialogBody>

                    <img style={{ width: "60%", display: "block", marginLeft: "auto", marginRight: "auto" }} src={this.logoUrl} alt="Logo" />


                    <section style={{ marginTop: "16px", marginBottom: "16px", textAlign: "center" }}>
                        <a href={"javascript:void(0) // workaround for underpopup dialog from roll20 regarding leaving the site"} onClick={this.openGithub}>
                            <img height="32" width="32" src="https://unpkg.com/simple-icons@latest/icons/github.svg" />
                        </a>
                    </section>

                    <section>
                        <table>
                            {mkEntry("Git Branch", R20ES_BRANCH)}
                            {mkEntry("Commit", R20ES_COMMIT)}
                        </table>
                    </section>


                </DialogBody>

                <section style={{ margin: "20px" }}>
                    <input
                        className="btn"
                        style={{ width: "100%", height: "auto", boxSizing: "border-box" }}
                        type="button"
                        onClick={this.close}
                        value="OK" />
                </section>

            </Dialog>
        )
    }
}

class SettingsDialog extends DialogBase {
    constructor(hooks) {
        super("r20es-settings-dialog");
        this.hooks = hooks;

        this.activeModule = null;
        this.onSelect = this.onSelect.bind(this);
        this.prevModuleElem = null;
        this.openAbout = this.openAbout.bind(this);

        this.about = new AboutDialog();
    }

    onSelect(selectedModule) {
        this.activeModule = _.isEqual(this.activeModule, selectedModule) ? null : selectedModule;
        this.rerender();
    }

    openAbout() {
        this.about.show();
    }

    render() {

        let byCategory = {};

        for (let key in this.hooks) {
            let hook = this.hooks[key];
            if (hook.force && !hook.forceShowConfig) continue;

            if (!(hook.category in byCategory))
                byCategory[hook.category] = [];

            byCategory[hook.category].push(key);
        }


        return (
            <Dialog>
                <DialogHeader>
                    <h2>Roll20 Enhancement Suite Module Settings</h2>
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
                        <input className="btn" type="button" onClick={this.openAbout} value="About" />
                        <input className="btn" style={{ float: "right" }} type="button" onClick={this.close} value="Apply & Close" />
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>

        );
    }

    dispose() {
        super.dispose();
        this.about.dispose();
    }
}

class SettingsModule extends R20Module.OnAppLoadBase {
    constructor() {
        super(__filename);

        // referenced by WelcomeModule.js
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
    }

    dispose() {
        super.dispose();
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
