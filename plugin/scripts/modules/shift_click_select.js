window.r20es.onAppLoad.addEventListener(() => {
    if (!window.is_gm) return;

    function handleMouseUp(_e) {
        if (!window.r20es.keyDown.shift) return;

        const e = _e.e;
        const canvas = window.d20.engine.canvas;

        for (let obj of canvas._objects) {
            if (canvas.containsPoint(e, obj) && obj.model) {
                let layer = obj.model.get("layer");

                if (window.currentEditingLayer === layer) return;

                const selector = window.r20es.getLayerData(layer).selector;
                $(selector).trigger("click");

                if (window.r20es.hooks.shiftClickToTokenLayer.config.select) {
                    window.d20.engine.unselect();
                    window.d20.engine.select(obj);
                }
            }
        }
    }

    d20.engine.canvas.on("mouse:down", handleMouseUp);

    window.r20es.keyDown = {};

    function keyCallback(e) {
        window.r20es.keyDown.shift = e.shiftKey;
    }

    document.addEventListener("keydown", keyCallback);
    document.addEventListener("keyup", keyCallback);

    console.log("shit_click_select ready!");
});

