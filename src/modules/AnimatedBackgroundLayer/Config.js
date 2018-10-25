import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "animatedBackground",
    name: "Animated Background",
    description: "Displays an animated background if the GM has one set up for the page. Setup can be found in the top-left corner, look for a orange film button.",
    category: Category.canvas,
    
    includes: "assets/app.js",
    find: `var o=e/d20.engine.canvasZoom;`,
    patch: `>>R20ES_MOD_FIND>>if(window.r20es && window.r20es.onZoomChange) window,r20es.onZoomChange(e);`,
});
