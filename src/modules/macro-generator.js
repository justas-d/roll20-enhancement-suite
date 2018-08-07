import { R20Module } from "../tools/r20Module";
import { R20 } from "../tools/r20api";

class MacroGeneratorModule extends R20Module.SimpleBase {
    constructor(id) {
        super(id);
        this.getAllActions = this.getAllActions.bind(this);
    }

    getAllActions(pc) {
        // only finds attack actions currently.
        const keyword = "repeating_attack";
        let table = {}

        pc.attribs.models.forEach(a => {
            const name = a.get("name");
            if(!name.startsWith(keyword)) return;
            const words = name.split('_');
            if(words.length < 2) return;

            const id = words[2];
            table[id] = true;
        });

        const ids = pc.repeatingKeyOrder(Object.keys(table), keyword);

        const orderedNames = [];
        for(let id of ids) {
            const query = `${keyword}_${id}_atkname`;
            const name = pc.attribs.models.find(a => a.get("name") === query);

            if(!name) {
                console.error(`Could not find name for attack id ${id}`);
                continue;
            }

            orderedNames.push(name.get("current"));
        }

        return orderedNames;
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