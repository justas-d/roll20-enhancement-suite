let div = document.createElement("div");

div.style.height ="auto";
div.style.marginBottom ="15px";
div.style.marginRight ="15px";
div.style.width ="auto";
div.style.maxWidth ="100%";
div.style.overflowX ="hidden";
div.style.position ="absolute";
div.style.bottom ="0";
div.style.right ="0";
div.style.backgroundClip = "border-box";

let text = document.createElement("p");
text.style.fontFamily=  "Helvetica";
text.style.fontSize= "26px";


function render(layer) {
    let data = window.r20es.getCustomLayerData(layer);

    text.innerHTML = data.bigTxt;
    div.style.backgroundColor = data.bg;
}

div.appendChild(text);

render(window.currentEditingLayer);

document.getElementById("playerzone").appendChild(div);

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

