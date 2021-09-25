import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    name: "Userscript Update Checker",
    id: "Userscript Update Checker",
    description: `Automatically checks for new updates (Userscript only).`,
    category: Category.misc,
});
