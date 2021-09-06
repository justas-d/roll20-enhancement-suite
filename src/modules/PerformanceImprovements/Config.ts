import MakeConfig from '../MakeConfig';
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "perfImprovements",
    name: "Performance Improvements",
    description: "Attempts to improve performance.",
    category: Category.misc,

    config: {
        disable_frame_recorder: true
    },

    configView: {
        disable_frame_recorder: {
            display: "Disable Renderer Profiler (if present)",
            type: ConfigViews.Checkbox,
        },
    },
});
