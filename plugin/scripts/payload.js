console.log("[r20es] payload.js is being injected.");

r20es = {};
window.r20es = r20es;


r20es.getTransform = function (ctx) {
  if ('currentTransform' in ctx) {
    return ctx.currentTransform
  }
  // restructure FF's array to an Matrix like object
  else if (ctx.mozCurrentTransform) {
    let a = ctx.mozCurrentTransform;
    return {a:a[0], b:a[1], c:a[2], d:a[3], e:a[4], f:a[5]};
  }
};

r20es.getRotation = function (ctx) {
  let t = window.r20es.getTransform(ctx);
  let rad = Math.atan2(t.b, t.a);
  if (rad < 0) { // angle is > Math.PI
    rad += Math.PI * 2;
  }
  return rad;
};

r20es.tokenDrawBg = function(ctx, graphic) {

    {
        let layer = graphic.model.get("layer");
        let data = null;

        if(layer === "map") data = {txt: "MP", bg: "rgba(255,255,0,0.5)"}
        else if(layer === "objects") data = {txt: "TK", bg: "rgba(255,0,0,0.5)"}
        else if(layer === "gmlayer") data = {txt: "GM", bg: "rgba(0,255,0,0.5)"}
        else data = {txt: layer, bg: "rgba(255,255,255,0.5)"}

        ctx.save();
        ctx.rotate(-window.r20es.getRotation(ctx));

        let sz = 18
        ctx.font = "bold " + sz + "px Arial";
        let txtSize = ctx.measureText(data.txt);
        let offX = Math.floor(graphic.get("width")/2) - txtSize.width;
        let offY = Math.floor(graphic.get("height")/2);

        ctx.fillStyle = data.bg;
        ctx.fillRect(offX, offY-sz, txtSize.width, sz);

        ctx.strokeStyle= "rgba(0,0,0, 1)";
        ctx.fillStyle= "rgba(255,255,255, 1)";
        
        ctx.strokeText(data.txt, offX, offY);
        ctx.fillText(data.txt, offX, offY);

        ctx.restore();
    }
};

function exportPc(pc) {
    console.log(pc);
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

        return true;
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

function createAndImportPc(fileHandle, errCallback) {
    if(!fileHandle) {
        return "No file selected";
    }

    let reader = new FileReader();
    reader.readAsText(fileHandle);

    reader.onload = (e) => {
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

            if(!stored) {
                stored = pc.attribs.create();
            }

            stored.attributes.name = importAttrib.name;
            stored.attributes.current = importAttrib.current;
            stored.attributes.max = importAttrib.max;
            stored.save();
        }

        pc.view.render();
        pc.save();

        console.log("Imported!")
    };

    return "";
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

    let errMsg = document.createElement("p");
    root.appendChild(errMsg);

    removeIfExists(importDivId, rootOfDiv);

    let fs = document.createElement("input");
    fs.type = "file";
    fs.id = importFileSelectorId;

    fs.onchange= (e) => {
        errMsg.innerHTML = "";

        if(e.target.files.length > 0) {
            let btn = document.createElement("button");
            btn.innerHTML = "Import Character";
            btn.id = importButtonId;
            btn.style.float = "none";

            btn.onclick = () => {
                errMsg.innerHTML = createAndImportPc(e.target.files[0]);
                removeIfExists(importButtonId, root);
                e.target.value = "";
            };

            root.appendChild(btn);
        } else {
            removeIfExists(importButtonId, root);
        }
    };

    root.appendChild(fs);
    rootOfDiv.appendChild(root);
}


console.log("[r20es] payload.js injected.");
