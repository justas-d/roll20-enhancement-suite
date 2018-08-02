function exportPc(pc) {

    let data = {
        schema_version: 1,
        name: pc.attributes.name,
        avatar: pc.attributes.avatar,
        bio: pc._blobcache.bio,
        attribs: pc.attribs
    };

    let jsonData = JSON.stringify(data, null, 4);

    var jsonBlob = new Blob([jsonData], { type: 'data:application/javascript;charset=utf-8' });
    saveAs(jsonBlob, data.name + ".json");
}

let formatVersions = {
    1: {
        isValidData: function(data) {

            let invalid = msg => { return {isValid: false, reason: msg}; }
            let hasNot = what => !(what in data);
        
            if(hasNot("name")) return invalid("name not found");
            if(hasNot("avatar")) return invalid("avatar not found");
            if(hasNot("bio")) return invalid("bio not found");
            if(hasNot("attribs")) return invalid("attribs not found");

            let idx = 0;
            for(let attrib of data.attribs) {
                if(!("name" in attrib)) return invalid(`Attribute index ${idx} doesn't have name`);
                if(!("current" in attrib)) return invalid(`Attribute index ${idx} doesn't have current`);
                if(!("max" in attrib)) return invalid(`Attribute index ${idx} doesn't have max`);
            }

            return {isValid: true};
        },
    
        overwrite: function(pc, data) {
            pc.save({
                name: data.name,
                avatar: data.avatar,
        
            });
            
            pc.updateBlobs({bio: data.bio});
        
            for(let i = 0; i < data.attribs.length; i++) {
            
                let importAttrib = data.attribs[i];
                let stored = null;
            
                for(let storedIdx = 0; storedIdx < pc.attribs.models.length; storedIdx++) {
                    let model = pc.attribs.models[storedIdx];
                    if(model.get("name") === importAttrib.name) {
                        stored = model;
                        break;
                    }
                }

                if(!stored) {
                    pc.attribs.create({
                        name: importAttrib.name,
                        current: importAttrib.current,
                        max: importAttrib.max
                    });
                } else {
                    stored.attributes.name = importAttrib.name;
                    stored.attributes.current = importAttrib.current;
                    stored.attributes.max = importAttrib.max;
                    stored.save();
                }
            }
    
            pc.view.render();
            pc.save();
    
            console.log("Imported!")
        }
    }
};

function processFileReading(fileHandle, customCode) {
    return window.r20es.readFile(fileHandle, (e) => {
        let data = window.r20es.safeParseJson(e.target.result);
        if(!data) return;

        let version = formatVersions[data.schema_version];
        if(!version) {
            alert(`Unknown schema version: ${data.schema_version}`);
            return;
        }

        let validity = version.isValidData(data);

        if(!validity.isValid) {
            alert(`Character data does not adhere to the schema version (${data.schema_version}). Reason: ${validity.reason}`);
            return;
        }

        customCode(version, data);
    });
}

function mutCallback(muts) {
    for(var e of muts) {
        if(e.target.className && e.target.className === "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix") {
                   
            let pcElem = e.target.parentElement.getElementsByClassName("characterdialog")[0];
            if(!pcElem) return false;

            let pc = window.Campaign.characters.get(pcElem.attributes["data-characterid"].value);

            const exportButtonClass = "r20es-export";
    
            if(e.target.getElementsByClassName(exportButtonClass).length > 0) { 
                return false;
            }
            
            let root = document.createElement("span");
            e.target.appendChild(root);

            let exportButton = document.createElement("button");
            exportButton.innerHTML = "Export";
            exportButton.classList.add("btn");
            exportButton.onclick = _ => { 
                exportPc(pc); 
            };
            exportButton.classList.add(exportButtonClass);
            exportButton.style.paddingLeft = 8;
            root.appendChild(exportButton);
            
            let fs = document.createElement("input");
            fs.type = "file";
            fs.style.display = "inline";

            let overwriteButton = document.createElement("button");
            overwriteButton.innerHTML = "Overwrite";
            overwriteButton.classList.add("btn");
            overwriteButton.disabled = true;
            overwriteButton.style.paddingLeft = 8;

            overwriteButton.onclick = _ => { 

                processFileReading(fs.files[0], (version, data) => {
                    if(window.confirm(`Are you sure you want to overwrite ${pc.get("name")}`))
                        version.overwrite(pc, data);
                });
            
                fs.value = "";
                overwriteButton.disabled = true;
            };

            fs.onchange= (e) => {
                overwriteButton.disabled = !(e.target.files.length > 0);
            };

            root.appendChild(overwriteButton);            
            root.appendChild(fs);
        }
    }
}

window.r20es.onAppLoad.addEventListener(() => {
    var observer = new MutationObserver(mutCallback);
    observer.observe(document.body, { childList: true, subtree: true });

    let journal = document.getElementById("journal");
    let root = document.createElement("div");
    journal.appendChild(root);

    {
        let header = document.createElement("h3");
        header.style.marginBottom = "5px";
        header.style.marginLeft= "5px";
        header.innerHTML = "Import Character";
        root.appendChild(header);
    }

    let fs = document.createElement("input");
    fs.type = "file";

    let btn = document.createElement("button");
    btn.innerHTML = "Import Character";
    btn.style.float = "Left";
    btn.disabled = true;
    btn.className = "btn";

    btn.onclick = () => {
        processFileReading(fs.files[0], (version, data) => {
            let pc = window.Campaign.characters.create();
            version.overwrite(pc, data);
        });
    
        fs.value = "";
        btn.disabled = true;
    };

    fs.onchange= (e) => {
        btn.disabled = !(e.target.files.length > 0);
    };

    root.appendChild(btn);
    root.appendChild(fs);
});

console.log("Loaded character_io");