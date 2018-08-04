function exportPc(pc) {

    pc._getLatestBlob("defaulttoken", dt => {
        let data = {
            schema_version: 2,
            oldId: pc.attributes.id,
            name: pc.attributes.name,
            avatar: pc.attributes.avatar,
            bio: pc._blobcache.bio,
            gmnotes: pc._blobcache.gmnotes,
            defaulttoken: dt || "",
            attribs: [],
            abilities: []
        };

        for (let attrib of pc.attribs.models) {
            data.attribs.push({
                name: attrib.attributes.name,
                current: attrib.attributes.current,
                max: attrib.attributes.max,
                id: attrib.attributes.id,
            });
        }

        for (let abil of pc.abilities.models) {
            data.abilities.push({
                name: abil.attributes.name,
                description: abil.attributes.description,
                istokenaction: abil.attributes.istokenaction,
                action: abil.attributes.action,
                order: abil.attributes.order
            });
        }

        let jsonData = JSON.stringify(data, null, 4);

        var jsonBlob = new Blob([jsonData], { type: 'data:application/javascript;charset=utf-8' });
        saveAs(jsonBlob, data.name + ".json");
    });
}


let formatVersions = {};

let fmtInvalid = msg => { return { isValid: false, reason: msg }; }

formatVersions[1] = {
    isValidData: function (data) {

        let hasNot = what => !(what in data);

        if (hasNot("name")) return fmtInvalid("name not found");
        if (hasNot("avatar")) return fmtInvalid("avatar not found");
        if (hasNot("bio")) return fmtInvalid("bio not found");
        if (hasNot("attribs")) return fmtInvalid("attribs not found");

        let idx = 0;
        for (let el of data.attribs) {
            if (!("name" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have name`);
            if (!("current" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have current`);
            if (!("max" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have max`);
        }

        return { isValid: true };
    },

    overwrite: function (pc, data) {
        pc.save({
            name: data.name,
            avatar: data.avatar,

        });

        pc.updateBlobs({ bio: data.bio });
        pc.attribs.reset();

        for (let importAttrib of data.attribs) {
            pc.attribs.create(importAttrib);
        }

        pc.view.render();
        pc.save();

        console.log("Imported v1!");
    }
};

formatVersions[2] = {
    isValidData: function (data) {

        let hasNot = what => !(what in data);

        if (hasNot("name")) return fmtInvalid("name not found");
        if (hasNot("oldId")) return fmtInvalid("oldId not found");
        if (hasNot("avatar")) return fmtInvalid("avatar not found");
        if (hasNot("bio")) return fmtInvalid("bio not found");
        if (hasNot("gmnotes")) return fmtInvalid("gmnotes not found");
        if (hasNot("attribs")) return fmtInvalid("attribs not found");
        if (hasNot("defaulttoken")) return fmtInvalid("attribs not found");

        let idx = 0;
        for (let el of data.attribs) {
            if (!("name" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have name`);
            if (!("current" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have current`);
            if (!("max" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have max`);
            if (!("id" in el)) return fmtInvalid(`Attribute index ${idx} doesn't have id`);
        }

        idx = 0;
        for (let el of data.abilities) {
            if (!("name" in el)) return fmtInvalid(`Ability index ${idx} doesn't have name`);
            if (!("description" in el)) return fmtInvalid(`Ability index ${idx} doesn't have description`);
            if (!("istokenaction" in el)) return fmtInvalid(`Ability index ${idx} doesn't have istokenaction`);
            if (!("action" in el)) return fmtInvalid(`Ability index ${idx} doesn't have action`);
            if (!("order" in el)) return fmtInvalid(`Ability index ${idx} doesn't have order`);
        }

        return { isValid: true };
    },

    overwrite: function (pc, data) {

        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        // some attributes store the id of the exported character
        // we replace them here with the new id 
        let jsonData = JSON.stringify(data);
        let oldIdRegexp = new RegExp(escapeRegExp(data.oldId), 'g');
        jsonData = jsonData.replace(oldIdRegexp, pc.attributes.id);
        data = JSON.parse(jsonData);

        // replace represents id
        if(data.defaulttoken) {
            data.defaulttoken = data.defaulttoken.replace(oldIdRegexp, pc.attributes.id);
        }

        let save = {
            name: data.name,
            avatar: data.avatar,
        };
        
        {
            let blobs = {};
            let shouldUpdate = false;
            if(data.bio.length > 0) { blobs.bio = data.bio; shouldUpdate = true; }
            if(data.gmnotes.length > 0) { blobs.gmnotes = data.gmnotes; shouldUpdate = true; }
            if(data.defaulttoken.length > 0) { blobs.defaulttoken = data.defaulttoken; shouldUpdate = true; }

            if (shouldUpdate)  {
                pc.updateBlobs(blobs);

                if("defaulttoken" in blobs) {
                    save.defaulttoken = (new Date).getTime();
                }
            }
        }

        {
            pc.attribs.reset();
            for (let importAttrib of data.attribs) {
                pc.attribs.create(importAttrib);
            }
        }

        {
            pc.abilities.reset();
            for (let abil of data.abilities) {
                pc.abilities.create(abil);
            }
        }

        pc.view.render();
        pc.save(save);
        
        console.log("Imported v2!");
    }
};

function processFileReading(fileHandle, customCode) {
    return window.r20es.readFile(fileHandle, (e) => {
        let data = window.r20es.safeParseJson(e.target.result);
        if (!data) return;

        let version = formatVersions[data.schema_version];
        if (!version) {
            alert(`Unknown schema version: ${data.schema_version}`);
            return;
        }

        let validity = version.isValidData(data);

        if (!validity.isValid) {
            alert(`Character data does not adhere to the schema version (${data.schema_version}). Reason: ${validity.reason}`);
            return;
        }

        customCode(version, data);
    });
}

function mutCallback(muts) {
    for (var e of muts) {
        if (e.target.className && e.target.className === "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix") {

            let pcElem = e.target.parentElement.getElementsByClassName("characterdialog")[0];
            if (!pcElem) return false;

            let pc = window.Campaign.characters.get(pcElem.attributes["data-characterid"].value);

            const exportButtonClass = "r20es-export";

            if (e.target.getElementsByClassName(exportButtonClass).length > 0) {
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
            exportButton.style.marginRight = "8px";
            root.appendChild(exportButton);

            let fs = document.createElement("input");
            fs.type = "file";
            fs.style.display = "inline";

            let overwriteButton = document.createElement("button");
            overwriteButton.innerHTML = "Overwrite";
            overwriteButton.classList.add("btn");
            overwriteButton.disabled = true;
            overwriteButton.style.marginRight = "8px";

            overwriteButton.onclick = _ => {

                processFileReading(fs.files[0], (version, data) => {
                    if (window.confirm(`Are you sure you want to overwrite ${pc.get("name")}`))
                        version.overwrite(pc, data);
                });

                fs.value = "";
                overwriteButton.disabled = true;
            };

            fs.onchange = (e) => {
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

    if(!window.is_gm) return;

    let journal = document.getElementById("journal").getElementsByClassName("content")[0];
    window.r20es.addSidebarSeparator(journal);

    let root = document.createElement("div");
    journal.appendChild(root);

    {
        let header = document.createElement("h3");
        header.style.marginBottom = "5px";
        header.style.marginLeft = "5px";
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

    fs.onchange = (e) => {
        btn.disabled = !(e.target.files.length > 0);
    };

    root.appendChild(fs);
    root.appendChild(btn);
});

console.log("Loaded character_io");