window.r20es.onAppLoad.addEventListener(() => {
    if (window.is_gm) {

        const selectId = "r20es-select";
        const layerId = "r20es-layer";

        const divStyle = {
            padding: "4px",
            height: "30px",
        }

        const textStyle = {
            fontFamily: "Helvetica",
            fontSize: "26px",
            display: "inline-block",
            verticalAlign: "middle",
            margin: "0px",
            lineHeight: divStyle.height
        }

        window.r20es.createElement("div", {
            style: {
                marginBottom: "15px",
                marginRight: "15px",
                width: "auto",
                maxWidth: "100%",
                overflowX: "hidden",
                position: "absolute",
                bottom: "0",
                right: "0",
                backgroundClip: "border-box"
            }

        },
            [
                window.r20es.createElement("div", {
                    id: selectId,
                    style: window.r20es.copy(divStyle, {background: "rgba(255,0,0,0.5)"})
                },
                    [
                        window.r20es.createElement("p", { 
                            innerHTML: "Not selecting!",
                            style: textStyle 
                        })
                    ]
                ),
                window.r20es.createElement("div", {
                    id: layerId,
                    style: divStyle
                },
                    [
                        window.r20es.createElement("p", { style: textStyle })
                    ]
                )

            ], document.getElementById("playerzone")
        );

        function render(layer) {
            let data = window.r20es.getLayerData(layer);

            const div = $(`#${layerId}`)[0];
            const text = $(div).find("p")[0];

            div.style.backgroundColor = data.bg;
            text.innerHTML = data.bigTxt;
        }

        render(window.currentEditingLayer);

        function callback(ctx) {
            let l = "";

            if (ctx.target.className === "choosegmlayer") { l = "gmlayer"; }
            else if (ctx.target.className === "choosemap") { l = "map"; }
            else if (ctx.target.className === "chooseobjects") { l = "objects"; }

            render(l);
        }

        $("#editinglayer li.chooseobjects").on("click", callback);
        $("#editinglayer li.choosemap").on("click", callback);
        $("#editinglayer li.choosegmlayer").on("click", callback);

        function updateModeIndicator(mode) {

            const div = $(`#${selectId}`)[0];
            div.style.display = (mode === "select" ? "none" : "block");
        }

        updateModeIndicator(window.d20.engine.mode);

        window.r20es.setModePrologue = updateModeIndicator;
    }
});
