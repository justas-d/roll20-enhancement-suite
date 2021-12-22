export interface IMacroFactory {
    name: string;
    create: (char: Roll20.Character) => IGeneratedMacro[];
    createFolderEntries?: (char: Roll20.Character) => string[];
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

