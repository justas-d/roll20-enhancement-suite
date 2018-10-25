import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "rememberTextToolSettings",
    name: "Remember Text Tool Settings",
    description: "Remembers the last used settings for the text tool.",
    category: Category.canvas,

    config: {
        color: "rgb(0,0,0)",
        size: 16,
        font: "Arial",
    },
});
