import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "animatedBackground",
    name: "Animated Background",
    description: "Provides an animate",
    category: Category.canvas,

    includes: "assets/app.js",
    find: `var o=e/d20.engine.canvasZoom;`,
    patch: `>>R20ES_MOD_FIND>>if(window.r20es && window.r20es.onZoomChange) window,r20es.onZoomChange(e);`,
});
