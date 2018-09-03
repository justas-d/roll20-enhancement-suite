import { Character } from "roll20";

type FactoryLambda = (character: Character) => IGeneratedMacro[];
type MacroFactoryTable = { [id: string]: FactoryLambda };
type ActionTypeTable = {[id: string]: string};

interface IMacroGenerator {
    actionTypes: ActionTypeTable // id -> name
    id: string;
    name: string;
    macroFactories: MacroFactoryTable;
}

interface IGeneratedMacro {
    name: string;
    macro: string;
}

interface IMacroDiff extends IGeneratedMacro {
    oldMacro: string;
}

export { IMacroDiff, IMacroGenerator, IGeneratedMacro, FactoryLambda, MacroFactoryTable, ActionTypeTable};
