interface ISlimMacro {
    name: string;
    action: string;
};

type TableOfMacrosByCategoryAndId = {[category: string]: {[id: string]: ISlimMacro}};

export {
    ISlimMacro,
    TableOfMacrosByCategoryAndId,
}