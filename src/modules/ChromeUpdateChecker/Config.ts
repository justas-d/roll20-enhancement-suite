import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    name: "Chrome Update Checker",
    id: "chromeUpdateChecker",
    description: `Automatically checks for new updates (Chrome only).`,
    category: Category.misc,
});
