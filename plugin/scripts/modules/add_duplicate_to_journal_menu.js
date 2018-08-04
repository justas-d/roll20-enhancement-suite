let menu = document.getElementById("journalitemmenu");
if(menu) {
    window.r20es.createElement("li", {
        "data-action-type": "r20esduplicate",
        innerHTML: "Duplicate"
    }, null, menu.firstElementChild);
}