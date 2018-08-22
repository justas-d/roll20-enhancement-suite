
const hook = R20Module.makeHook(__filename, {
    id: "myModuleId",
    name: "My Module",
    description: "This is my module's description.",
    category: R20Module.category.canvas,
    gmOnly: true,

    includes: "assets/app.js",
    find: "this.model.view.updateBackdrops(e),this.active",
    patch: "this.model.view.updateBackdrops(e), window.is_gm && window.r20es && window.r20es.tokenDrawBg && window.r20es.tokenDrawBg(e, this), this.active",

    configView: {
        globalAlpha: {
            display: "Global alpha",
            type: "slider",

            sliderMin: 0,
            sliderMax: 1,
        },

        rotateAlongWithToken: {
            display: "Rotate overlay along with token",
            type: "checkbox"
        },

        textStrokeWidth: {
            display: "Text outline width",
            type: "number",

            numberMin: 0,
        },
        textStrokeOpacity: {
            display: "Text stroke opacity",
            type: "text",
        },

        textStrokeColor: {
            display: "Text stroke color",
            type: "color"
        },
        bar: {
            display: "HP Bar",
            type: "dropdown",

            dropdownValues: {
                bar1: "Bar 1",
                bar2: "Bar 2",
                bar3: "Bar 3"
            },
        }

    },

    config: {
        globalAlpha: 1,
        backgroundOpacity: 0.5,
        textStrokeWidth: 2,
        textStrokeOpacity: 1,
        textStrokeColor: [0, 0, 0],
        textFillOpacity: "aaaaaaaaaaaaaaa",
        textFillColor: [255, 255, 255],
        bar: "bar1"
    },
});

export { hook as 1FILLME };
