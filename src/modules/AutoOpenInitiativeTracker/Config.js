import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';
import { DIALOG_OPEN_DELAY_KEY } from "./Constants";

export default MakeConfig(__dirname, {
    id: "autoOpenInitiativeTracker",
    name: "Open Turn Tracker On Initiative",
    description: "Automatically opens the turn tracker when somebody rolls initiative.",
    category: Category.initiative,
    gmOnly: true,


    configView: {
        [DIALOG_OPEN_DELAY_KEY]: {
            display: "Delay between opening the initiative dialog in milliseconds (low values may cause issues)",
            type: ConfigViews.Number
        },
    },

    config: {
        [DIALOG_OPEN_DELAY_KEY]: 500,

    },
});
