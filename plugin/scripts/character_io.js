function exportPc(pc) {
    let data = {};
    data.name = pc.attributes.name;
    data.avatar = pc.attributes.avatar;
    data.bio = pc._blobcache.bio;
    data.attribs = pc.attribs;

    let jsonData = JSON.stringify(data, null, 4);

    var jsonBlob = new Blob([jsonData], { type: 'data:application/javascript;charset=utf-8' });
    saveAs(jsonBlob, data.name + ".json");
}

function matchAndProcessTitle(t, e) {

    if(t.className === "ui-dialog-title") {

        let pcElem = t.parentElement.parentElement.getElementsByClassName("characterdialog")[0];
        if(!pcElem) return false;

        let pcId = pcElem.attributes["data-characterid"].value;
        const exportButtonClass = "io-export";

        if(t.getElementsByClassName(exportButtonClass).length > 0) { 
            return false;
        }

        let exportButton = document.createElement("button");
        exportButton.innerHTML = "Export";
        exportButton.classList.add("btn");
        exportButton.onclick = () => { exportPc(window.Campaign.characters.get(pcId)); };
        exportButton.classList.add(exportButtonClass);

        t.appendChild(exportButton);

        return true;("===========================================================================");
    }

    return false;
}

// dom mutation watcher that will let us attach export/import buttons to character sheets.
var callback = function(mutationsList) {
    for(var e of mutationsList) {
        if(!matchAndProcessTitle(e.target, e)) {
            for(let t of e.addedNodes)
                matchAndProcessTitle(t, e);
        }
    }
};

// Create an observer instance linked to the callback function
var observer = new MutationObserver(callback);
observer.observe(document.body, { childList: true, subtree: true });


function removeIfExists(id, root) {
    let exists = document.getElementById(id);
    if(exists) {
        root.removeChild(exists);
    }
}

function createAndImportPc(fileHandle) {

    window.r20es.readFile(fileHandle, (e) => {
        let data = JSON.parse(e.target.result);

        let pc = window.Campaign.characters.create({
            name: data.name,
            avatar: data.avatar
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

            stored.attributes.name = importAttrib.name;
            stored.attributes.current = importAttrib.current;
            stored.attributes.max = importAttrib.max;
            stored.save();
        }

        pc.view.render();
        pc.save();

        console.log("Imported!")

    });
}

{
    const importDivId = "io-import-div";
    const importButtonId = "io-import";
    const importFileSelectorId = "io-import-fileselector";

    let rootOfDiv = document.getElementById("journal");
    let root = document.createElement("div");
    root.id = importDivId;

    {
        let header = document.createElement("h3");
        header.style.marginBottom = "5px";
        header.style.marginLeft= "5px";
        header.innerHTML = "Import Character";
        root.appendChild(header);
    }

    let btn = document.createElement("button");
    btn.innerHTML = "Import Character";
    btn.id = importButtonId;
    btn.style.float = "Left";
    btn.className = "btn";

    btn.onclick = () => {
        createAndImportPc(fs.files[0]);
        e.target.value = "";
    };

    removeIfExists(importDivId, rootOfDiv);

    let fs = document.createElement("input");
    fs.type = "file";
    fs.id = importFileSelectorId;

    fs.onchange= (e) => {
        btn.disabled = !(e.target.files.length > 0);
    };

    root.appendChild(fs);
    root.appendChild(btn);

    rootOfDiv.appendChild(root);
}
