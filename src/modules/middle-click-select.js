window.r20es.onAppLoad.addEventListener(() => {
    if (!window.is_gm) return;

    document.addEventListener("click", (e) =>{

        if(e.button !== 1) return;

        const canvas = window.d20.engine.canvas;
        
        window.d20.Campaign.activePage().reorderByZ();
        let objs = canvas.getObjects().reverse();

        for (let obj of objs) {
            if (canvas.containsPoint(e, obj) && obj.model) {
                let layer = obj.model.get("layer");

                if (window.currentEditingLayer !== layer) {

                    const selector = window.r20es.getLayerData(layer).selector;
                    $(selector).trigger("click");

                    if (window.r20es.hooks.middleClickToTokenLayer.config.select) {
                        window.d20.engine.unselect();
                        window.d20.engine.select(obj);
                    }
                }

                break;
            }
        }
    });
    
    console.log("shit_click_select ready!");
});


