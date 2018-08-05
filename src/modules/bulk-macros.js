
// dom mutation watcher that will let us attach export/import buttons to character sheets.
function callback(muts) {
    window.r20es.handleBulkMacroObserverCallback(muts);
};

// Create an observer instance linked to the callback function
var observer = new MutationObserver(callback);
observer.observe(document.body, { childList: true, subtree: true });