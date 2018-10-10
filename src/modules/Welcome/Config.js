import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    name: "Welcome",
    id: "welcomeScreen",
    force: true,
    forceShowConfig: true,
    category: Category.misc,

    configView: {
        showWelcomePopup: {
            display: "Show welcome message.",
            type: ConfigViews.Checkbox
        },

        showStartupGuide: {
            display: "Show startup guide",
            type: ConfigViews.Checkbox
        },

        showChangelog: {
            display: "Show changelog",
            type: ConfigViews.Checkbox
        },
    },

    config: {
        hasShownDiscordPoll: false,
        showWelcomePopup: true,
        showStartupGuide: true,
        showChangelog: true,
        previousVersion: "",
    },
});
