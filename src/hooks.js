import { DuplicateButtonHook } from "./modules/add-duplicate-to-journal-menu";
import { AutoPingNextTokenHook } from "./modules/auto-ping-next-token";
import { AutoSelectNextTokenHook } from "./modules/auto-select-next-token";
import { BulkMacroHook } from "./modules/bulk-macros";
import { ChangeIdWhenDuplicatingHook } from "./modules/change-id-when-duplicating";
import { CharacterIOHook } from "./modules/character-io";
import { DrawCurrentLayerHook } from "./modules/draw-current-layer";
import { InitiativeAdvanceShortcutHook } from "./modules/initiative-shortcuts";
import { MiddleClickSelectHook } from "./modules/middle-click-select";
import { AutoFocusNextToken } from "./modules/move-camera-to-token-on-turn";
import { rollAndApplyHitDiceHook } from "./modules/roll-and-apply-hit-dice";
import { TableIOHook } from "./modules/table-io";
import { TokenLayerDrawingHook } from "./modules/token-layer-drawing";
import { MacroGeneratorHook } from "./modules/macro-generator";
import { R20Module } from "./tools/r20Module";
import AutoSortInitiative from "./modules/auto-sort-initiative";
import { SettingsHook } from "./modules/settings";
import { TokenContextMenuApiModule } from "./modules/token-context-menu-module";

let hooks = {};
const addHook = hook => hooks[hook.id] = hook;

addHook({
    id: "exposeD20",
    force: true,

    includes: "assets/app.js",
    find: "var d20=d20||{};",
    patch: "var d20=d20||{};window.d20=d20;",
    expectedPatchCount: 2
});

addHook({
    id: "createFinalPageLoadEvent",
    force: true,

    includes: "assets/app.js",
    find: `$("#loading-overlay").hide()`,
    patch: `$("#loading-overlay").hide();window.r20es.onAppLoad.fire(null);`
})

addHook({
    id: "seenadOverride",
    force: true,

    name: "Skip ad",
    description: "Skips loading ads",
    category: R20Module.category.canvas,

    includes: "/editor/startjs/",
    find: "d20ext.showGoogleAd();",
    patch: 'window.d20ext.seenad = !0, $("#loading-overlay").find("div").hide(), window.currentPlayer && d20.Campaign.pages.length > 0 && d20.Campaign.handlePlayerPageChanges(), void $.get("/editor/startping/true");'
});

addHook(TokenContextMenuApiModule);
addHook(SettingsHook);
addHook(AutoSortInitiative);
addHook(DuplicateButtonHook);
addHook(AutoPingNextTokenHook);
addHook(AutoSelectNextTokenHook);
addHook(BulkMacroHook);
addHook(ChangeIdWhenDuplicatingHook);
addHook(CharacterIOHook);
addHook(DrawCurrentLayerHook);
addHook(InitiativeAdvanceShortcutHook);
addHook(MiddleClickSelectHook);
addHook(AutoFocusNextToken);
addHook(rollAndApplyHitDiceHook);
addHook(TableIOHook);
addHook(TokenLayerDrawingHook);
addHook(MacroGeneratorHook);

export { hooks };