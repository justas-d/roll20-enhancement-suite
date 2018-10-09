import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "arrowKeysCameraControls",
    name: "Arrow Key Camera Controls",
    description: "Allows the camera to be moved by pressing the arrow keys as long as a token is not selected",
    category: Category.canvas
});
