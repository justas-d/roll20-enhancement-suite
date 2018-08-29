import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "characterImportExport",
    name: "Character Importer/Exporter",
    description: "Provides character importing (in the journal) and exporting (in the journal and on sheets).",
    category: Category.exportImport,
    media: {
        "char_import.png": "Journal widget",
        "sheet_export.png": "Sheet tab",
    }
});
