window.r20es.onAppLoad.addEventListener(() => {

    if (!window.is_gm) return;

    var observer = new MutationObserver(mutationsList => {
        for (var e of mutationsList) {
            for (let target of e.addedNodes) {

                if(target.hasAttribute && !target.hasAttribute("r20es-table-id")) continue;
                const exportButton = $(target).find(".r20es-table-export-json")[0];
                
                if(!exportButton) {
                    continue;a
                }

                console.log("registered listener");
                exportButton.removeEventListener("click", window.r20es.exportTableToJson);
                exportButton.addEventListener("click", window.r20es.exportTableToJson);
                
                return;
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    let rootOfDiv = document.getElementById("deckstables").getElementsByClassName("content")[0];
    window.r20es.addSidebarSeparator(rootOfDiv);

    function setButtonDisabled(root, state) {
        let query = $(root).find(".btn");
        query.each(idx => {
            query[idx].disabled = state;
        });
    }

    function mkCallback(cb) {
        return e => {
            const input = $(e.target.parentNode).find("input")[0];

            window.r20es.readFile(input.files[0], (e2) => {
                cb(e2.target.result);
            });

            input.value = "";
            setButtonDisabled(e.target.parentNode, true);
        }
    };

    window.r20es.createElement("div", null, [
        window.r20es.createElement("h3", {
            innerHTML: "Import Rollable Table",
            style: {
                marginBottom: "5px",
                marginLeft: "5px"
            }
        }),
        window.r20es.createElement("input", {
            type: "file",
            onChange: (e) => { setButtonDisabled(e.target.parentNode, e.target.files.length <= 0); }
        }),
        window.r20es.createElement("button", {
            innerHTML: "Import",
            disabled: true,
            className: "btn",
            style: {
                float: "left"
            },
            onClick: mkCallback((e) => { window.r20es.importTablesFromJson(e) })
        }),
        window.r20es.createElement("button", {
            innerHTML: "Import (TableExport)",
            disabled: true,
            className: "btn",
            style: {
                float: "left",
            },
            onClick: mkCallback((e) => window.r20es.importTablesFromTableExport(e))
        })

    ], rootOfDiv);
})

console.log("table_io loaded");