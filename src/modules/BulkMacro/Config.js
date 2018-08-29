
import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "bulkMacros",
    name: "Bulk Macros",
    description: `Adds a "Bulk Macros" option to the token right click menu which lists macros that can be rolled for the whole selection in bulk.`,
    category: Category.token,
    gmOnly: true,
    media: {
        "bulk_macro.webm": "Rolling initiative for 3 tokens at once"
    }
});
