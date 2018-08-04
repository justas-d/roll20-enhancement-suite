let menu = document.getElementById("journalitemmenu");
if(menu) {
    let elem = window.r20es.createElement("li", {
        "data-action-type": "r20esduplicate"
    }, "Duplicate");

    menu.firstElementChild.appendChild(elem);
}