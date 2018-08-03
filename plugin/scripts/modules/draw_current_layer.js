window.r20es.onAppLoad.addEventListener(() => {
    if(window.is_gm) {
        
        const notSelectModeIndicatorId = "r20es-mode-indicator";

        let root= document.createElement("div");
        //    root.style.height ="auto";
        root.style.marginBottom ="15px";
        root.style.marginRight ="15px";
        root.style.width ="auto";
        root.style.maxWidth ="100%";
        root.style.overflowX ="hidden";
        root.style.position ="absolute";
        root.style.bottom ="0";
        root.style.right ="0";
        root.style.backgroundClip = "border-box";

        {
            let div = document.createElement("div");
            div.id = notSelectModeIndicatorId;
            div.style.background = "rgba(255,0,0,0.5)";
            div.style.padding = "4px";
            div.style.display = "none";
            root.appendChild(div);

            let text = document.createElement("p");
            text.style.fontFamily=  "Helvetica";
            text.style.fontSize= "26px"; 
            text.innerHTML = "NOT SELECTING!";
            div.appendChild(text);
        }
            
        let div = document.createElement("div");
        div.style.padding = "4px";
        root.appendChild(div);

        let text = document.createElement("p");
        text.style.fontFamily=  "Helvetica";
        text.style.fontSize= "26px"; 
        div.appendChild(text);

        function render(layer) { 
            let data = window.r20es.getCustomLayerData(layer);

            text.innerHTML = data.bigTxt;
            div.style.backgroundColor = data.bg;
        }

        render(window.currentEditingLayer);

        document.getElementById("playerzone").appendChild(root);

        function callback(ctx) { 
            let l = "";

            if(ctx.target.className === "choosegmlayer") { l = "gmlayer"; }
            else if(ctx.target.className === "choosemap") { l = "map"; }
            else if(ctx.target.className === "chooseobjects") { l = "objects"; }

            render(l); 
        }

        $("#editinglayer li.chooseobjects").on("click", callback);
        $("#editinglayer li.choosemap").on("click", callback);
        $("#editinglayer li.choosegmlayer").on("click", callback);

        function updateModeIndicator(mode) {
            
            let rmElem = document.getElementById(notSelectModeIndicatorId);
            rmElem.style.display = (mode === "select" ? "none" : "block");
        }

        updateModeIndicator(window.d20.engine.mode);

        window.r20es.setModePrologue = updateModeIndicator;
    }
});
