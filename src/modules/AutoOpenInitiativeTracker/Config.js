import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "autoOpenInitiativeTracker",
    name: "Open Turn Tracker On Initiative",
    description: "Automatically opens the turn tracker when somebody rolls initiative.",
    category: Category.initiative,
    gmOnly: true,


    configView: {
        onlyOpenIfTokenIsVisible: {
            display: "Only open tracker if the initiative token is on the player token layer.",
            type: ConfigViews.Checkbox
        }
    },

    config: {
        onlyOpenIfTokenIsVisible: true,
    },
});
