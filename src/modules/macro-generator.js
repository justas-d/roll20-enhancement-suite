import { R20Module } from "../tools/r20Module";
import { R20 } from "../tools/r20api";
import { OGL5eByRoll20MacroGenerator } from "../macro/OGL5eByRoll20.js";

class MacroGeneratorModule extends R20Module.SimpleBase {
    constructor(id) {
        super(id);
        this.getAllActions = this.getAllActions.bind(this);
    }

    getAllActions(char) {
        
        const factories = OGL5eByRoll20MacroGenerator.macroFactories;
        let data = [];

        for(let factoryId in factories) {
            const factory = factories[factoryId];
            data = data.concat(factory(char));
        }

        return data;        
    }

    setup() {
        window.r20es.getAllActions = this.getAllActions;
    }
}

if(R20Module.canInstall()) new MacroGeneratorModule(__filename).install();

const hook = R20Module.makeHook(__filename, {
    id: "macroGeneratorBase",
    name: "Character Sheet Macro Generator",
    description: "",
    category: "Dev",

});

export {hook as MacroGeneratorHook}