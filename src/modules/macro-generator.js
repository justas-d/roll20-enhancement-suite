import { R20Module } from "../tools/r20Module";
import { R20 } from "../tools/r20api";
import { OGL5eByRoll20MacroGenerator } from "../macro/OGL5eByRoll20.js";
import { DialogBase } from "../tools/dialogApi";
import { createElementJsx } from "../tools/createElement";

const generateButtonId = "r20esgenerate"

class GenerateMacrosDialog extends DialogBase {
    constructor(generators) {
        super();
        this.generators = generators;
    }

    render() {
        return (
            <div>
               <button class="btn" onClick={this.close}>Close</button>
            </div>
        )
    }
}

class MacroGeneratorModule extends R20Module.SimpleBase {
    constructor(id) {
        super(id);
        this.generators = {};

        const addGen = gen => this.generators[gen.id] = gen;
        addGen(OGL5eByRoll20MacroGenerator);

        this.getAllActions = this.getAllActions.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    getAllActions(char) {

        const factories = OGL5eByRoll20MacroGenerator.macroFactories;
        let data = [];

        for (let factoryId in factories) {
            const factory = factories[factoryId];
            data = data.concat(factory(char));
        }

        return data;
    }

    onButtonClick(e) {
        this.dialog.show();
    }

    setup() {
        this.dialog = new GenerateMacrosDialog(this.generators);
        window.r20es.macroGeneratorButtonClick = this.onButtonClick;
        window.r20es.temp = this.onButtonClick;
    }

    dispose() {
        this.dialog.dispose()
    }
}

if (R20Module.canInstall()) new MacroGeneratorModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "macroGeneratorBase",
    name: "Character Sheet Macro Generator",
    description: "",
    category: "Dev",

    mods: [
        {
            includes: "assets/app.js",
            find: `this.$el.on("click",".addabil"`,
            patch: `this.$el.on("click",".${generateButtonId}", (e) => window.r20es.macroGeneratorButtonClick(e)), this.$el.on("click",".addabil"`
        },

        {
            includes: "/editor/",
            find: `<button class='btn addabil'>+ Add</button>`,
            patch: `<button class='btn ${generateButtonId}'>Generate</button><button class='btn addabil'>+ Add</button>`,
        }
    ],

    config: {
        lastGenerator: OGL5eByRoll20MacroGenerator.id
    }
});

export { hook as MacroGeneratorHook }