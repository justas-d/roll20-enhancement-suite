function exportPc(pc) {
    console.log(pc);
    let data = {};
    data.name = pc.attributes.name;
    data.avatar = pc.attributes.avatar;
    data.attribs = pc.attribs;

    let jsonData = JSON.stringify(data, null, 4);
    var jsonBlob = new Blob([jsonData], { type: 'application/javascript;charset=utf-8' });

    var link=window.URL.createObjectURL(jsonBlob);
    window.open(link, "_blank");
}

function importPc(pc, fsId) {
    let fs = document.getElementById(fsId);
    let file = fs.files[0];
    console.log(fsId);
    console.log(fs);
    console.log(file);

    if(!file) {

        // TODO : warn the user
        console.log("NO FILE SELECTED");
        return;
    }

    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = (e) => {
        let data = JSON.parse(e.target.result);

        pc.attributes.name = data.name;
        pc.attributes.avatar = data.avatar;
 
        pc.save();

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
                stored = pc.attribs.create();
            }

            stored.attributes.name = importAttrib.name;
            stored.attributes.current = importAttrib.current;
            stored.attributes.max = importAttrib.max;
            stored.save();
        }

        pc.view.render();
        console.log(data);
    };
}

function getPcById(id) {
    return window.wrappedJSObject.Campaign.characters.get(id);
}

function injectObj(target, spec) {
    if(target.getElementsByClassName(spec.class).length > 0) { 
        return;
    }

    let obj = spec.create();
    obj.classList.add(spec.class);
    target.appendChild(obj);
}

function injectButton(target, button) {
    if(target.getElementsByClassName(button.class).length > 0) { 
        return;
    }

    target.appendChild(exportButton);
}

function makeButtonCreateFunc(text, objClass, callback) {
    return () => {
        let exportButton = document.createElement("button");
        exportButton.innerHTML = text;
        exportButton.classList.add("btn");
        exportButton.onclick = callback;
        return exportButton;
    };
}

let fileselectId = 0;

function makeFileselectId(id) {
    return "io-fs-" + id;
}

function matchAndProcessTitle(t, e) {
    if(t.className === "ui-dialog-title") {

        let pcElem = t.parentElement.parentElement.getElementsByClassName("characterdialog")[0];
        if(!pcElem) return;

        let pcId = pcElem.attributes["data-characterid"].value;
        let fsId = null;

        do {
            fsId = makeFileselectId(fileselectId++);
        } while(document.getElementById(fsId));

        injectObj(t, {
            class: "io-export",
            create: makeButtonCreateFunc("Export", "io-export", () => { exportPc(getPcById(pcId)); })
        });

        injectObj(t, {
            class: "io-import",
            create: makeButtonCreateFunc("Import", "io-import", () => { importPc(getPcById(pcId), fsId); })
        });

        injectObj(t, {
            class: "io-import-fileselect",
            create: () => {
                let sel = document.createElement("input");
                sel.type = "file";
                sel.id = fsId;
                sel.style.display ="inline";
                return sel;
            }
        });
    }
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
