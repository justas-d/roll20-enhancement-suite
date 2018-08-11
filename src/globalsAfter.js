// we've got to reset this after we have set everything up
// so that when we reload the plugin, all the hooks imported in globals.js
// via hooks.js don't think that they need to inject. 

// TLDR: Not resetting this value yields in modules being injected twice after reloading the plugin
window.r20es.canInstallModules = false;