
window.r20es.onAppLoad.addEventListener(() => {
    if(!window.is_gm) return;

    Mousetrap.bind("ctrl+right", () => {
        window.d20.Campaign.initiativewindow.nextTurn();
    });

})
