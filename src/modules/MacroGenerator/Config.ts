import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "macroGeneratorBase",
  name: "Character Sheet Ability Macro Generator",
  description: `Places a "Generate" button in the Attributes & Abilities that will open up the generate ability macros dialog. Only certain character sheets are supported. If you'd like to add your own sheet, submit a GitHub PR.`,
  category: VTTES.Module_Category.journal,
  gmOnly: false,
};
