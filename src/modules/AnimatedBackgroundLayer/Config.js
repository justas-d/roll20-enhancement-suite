import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "animatedBackground",
    name: "Animated Background",
    description: "Provides an animate",
    category: Category.canvas,
});
