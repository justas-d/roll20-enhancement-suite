import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "macroGeneratorBase",
    name: "Character Sheet Ability Macro Generator",
    description: `Places a "Generate" button in the Attributes & Abilities that will open up the generate ability macros dialog. Only certain character sheets are supported. If you'd like to add your own sheet, submit a GitHub PR.`,
    category: Category.journal,

});
