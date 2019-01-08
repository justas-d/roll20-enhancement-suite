import { Character } from "roll20";

export interface IMacroFactory {
    name: string;
    create: (char: Character) => IGeneratedMacro[];
    createFolderEntries: (char: Character) => string[];
    categoryNameModifier?: (name: string) => string;
}

export interface IMacroGenerator {
    id: string;
    name: string;
    macroFactories: IMacroFactory[];
}

export interface IGeneratedMacro {
    name: string;
    macro: string;
}

export interface IMacroDiff extends IGeneratedMacro {
    oldMacro: string;
}

