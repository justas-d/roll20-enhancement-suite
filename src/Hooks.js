import { DuplicateButtonHook } from "./modules/DuplicateButtonModule";
import { AutoPingNextTokenHook } from "./modules/AutoPingNextTokenModule";
import { AutoSelectNextTokenHook } from "./modules/AutoSelectNextTokenModule";
import { BulkMacroHook } from "./modules/BulkMacroModule";
import { ChangeIdWhenDuplicatingHook } from "./modules/ChangeIdWhenDuplicatingModule";
import { CharacterIOHook } from "./modules/CharacterIOModule";
import { DrawCurrentLayerHook } from "./modules/DrawCurrentLayerModule";
import { InitiativeAdvanceShortcutHook } from "./modules/InitiativeAdvanceShortcutModule";
import { AutoFocusNextToken } from "./modules/MoveCameraToTokenModule";
import { rollAndApplyHitDiceHook } from "./modules/RollAndApplyHitDiceModule";
import { TableIOHook } from "./modules/TableIOModule";
import { TokenLayerDrawingHook } from "./modules/TokenLayerDrawing";
import { MacroGeneratorHook } from "./modules/MacroGeneratorModule";
import { R20Module } from "./tools/R20Module";
import AutoSortInitiative from "./modules/AutoSortInitiativeModule";
import { SettingsHook } from "./modules/SettingsModule";
import { TokenContextMenuApiModule } from "./modules/TokenContextMenuApiModule";
import { MiddleClickSelectHook } from "./modules/MiddleClickSelectModule";
import { SheetTabApiHook } from "./modules/SheetTabApiModule";

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
    patch: `$("#loading-overlay").hide();if(window.r20es && window.r20es.onLoadingOverlayHide) window.r20es.onLoadingOverlayHide(); `
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
addHook(SheetTabApiHook);


export { hooks };
