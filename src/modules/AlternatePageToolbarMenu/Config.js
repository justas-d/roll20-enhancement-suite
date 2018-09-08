import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../tools/ConfigViews';

export default MakeConfig(__dirname, {
    id: "alternativePageToolbarMenu",
    name: "Alternative Page Toolbar Menu",
    description: "Replaces the default page toolbar menu with a more concise one.",
    category: Category.canvas,

    configView: {
        opacity: {
            type: ConfigViews.Slider,
            display: "Opacity",

            sliderMin: 0,
            sliderMax: 1
        },
    },

    config: {
        opacity: 1,
    },

    mods: [
        {
            "includes": "assets/app.js",
            "find": `e",axis:"x"`,
            "patch": `e"`
        },

        {
            "includes": "assets/app.js",
            "find": `,axis:"x"}).addTouch()`,
            "patch": `}).addTouch()`
        }
    ]
});
