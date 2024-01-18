import Mod_AdjustableOpacity          from "./modules/AdjustableOpacity/Module";
import Mod_AlternatePageToolbarMenu   from "./modules/AlternatePageToolbarMenu/Module";
import Mod_AlternativeRadialMenu      from "./modules/AlternativeRadialMenu/Module";
import Mod_AnimatedBackgroundLayer    from "./modules/AnimatedBackgroundLayer/Module";
import Mod_AnimationDisable           from "./modules/AnimationDisable/Module";
import Mod_ArrowKeysMoveCanvas        from "./modules/ArrowKeysMoveCanvas/Module";
import Mod_AutoOpenInitiativeTracker  from "./modules/AutoOpenInitiativeTracker/Module";
import Mod_AutoPingNextToken          from "./modules/AutoPingNextToken/Module";
import Mod_AutoSelectNextToken        from "./modules/AutoSelectNextToken/Module";
import Mod_AutoSortInitiative         from "./modules/AutoSortInitiative/Module";
import Mod_BulkMacro                  from "./modules/BulkMacro/Module";
import Mod_CameraStartPosition        from "./modules/CameraStartPosition/Module";
import Mod_ChangeIdWhenDuplicating    from "./modules/ChangeIdWhenDuplicating/Module";
import Mod_CharacterAvatarFromURL     from "./modules/CharacterAvatarFromURL/Module";
import Mod_CharacterIO                from "./modules/CharacterIO/Module";
import Mod_CharacterTokenModifier     from "./modules/CharacterTokenModifier/Module";
import Mod_ChromeUpdateChecker        from "./modules/ChromeUpdateChecker/Module";
import Mod_CounterTokenName           from "./modules/CounterTokenName/Module";
import Mod_CustomPathWidth            from "./modules/CustomPathWidth/Module";
import Mod_DisablePlayerDrawings      from "./modules/DisablePlayerDrawings/Module";
import Mod_DrawCurrentLayer           from "./modules/DrawCurrentLayer/Module";
import Mod_DuplicateButton            from "./modules/DuplicateButton/Module";
import Mod_HandoutImageFromURL        from "./modules/HandoutImageFromURL/Module";
import Mod_HidePlayerList             from "./modules/HidePlayerList/Module";
import Mod_InitiativeAdvanceShortcut  from "./modules/InitiativeAdvanceShortcut/Module";
import Mod_JukeboxIO                  from "./modules/JukeboxIO/Module";
import Mod_LibreAudio                 from "./modules/LibreAudio/Module";
import Mod_MacroGenerator             from "./modules/MacroGenerator/Module";
import Mod_MacroIO                    from "./modules/MacroIO/Module";
import Mod_MiddleClickSelect          from "./modules/MiddleClickSelect/Module";
import Mod_MoveCameraToToken          from "./modules/MoveCameraToToken/Module";
import Mod_NightMode                  from "./modules/NightMode/Module";
import Mod_PerformanceImprovements    from "./modules/PerformanceImprovements/Module";
import Mod_RollAndApplyHitDice        from "./modules/RollAndApplyHitDice/Module";
//import Mod_ScaleTokenNamesBySize      from "./modules/ScaleTokenNamesBySize/Module";
import Mod_SetTableEntryAvatarByUrl   from "./modules/SetTableEntryAvatarByUrl/Module";
import Mod_Settings                   from "./modules/Settings/Module";
import Mod_SheetTabApi                from "./modules/SheetTabApi/Module";
import Mod_TableIO                    from "./modules/TableIO/Module";
import Mod_TokenBarPositionAdjust     from "./modules/TokenBarPositionAdjust/Module";
import Mod_TokenContextMenuApi        from "./modules/TokenContextMenuApi/Module";
import Mod_TokenFromImg               from "./modules/TokenFromImg/Module";
import Mod_TokenLayerDrawing          from "./modules/TokenLayerDrawing/Module";
import Mod_TokenResize                from "./modules/TokenResize/Module";
import Mod_ToolsMenu                  from "./modules/ToolsMenu/Module";
import Mod_TransparentPaper           from "./modules/TransparentPaper/Module";
import Mod_Welcome                    from "./modules/Welcome/Module";
import Mod_UserscriptUpdateChecker    from "./modules/UserscriptUpdateChecker/Module";

const VTTES_MODULES = [];
const add_module = (m) => VTTES_MODULES.push(m);

add_module(Mod_AdjustableOpacity);
add_module(Mod_AlternatePageToolbarMenu);
add_module(Mod_AlternativeRadialMenu);
add_module(Mod_AnimatedBackgroundLayer);
add_module(Mod_AnimationDisable);
add_module(Mod_ArrowKeysMoveCanvas);
add_module(Mod_AutoOpenInitiativeTracker);
add_module(Mod_AutoPingNextToken);
add_module(Mod_AutoSelectNextToken);
add_module(Mod_AutoSortInitiative);
add_module(Mod_BulkMacro);
add_module(Mod_CameraStartPosition);
add_module(Mod_ChangeIdWhenDuplicating);
add_module(Mod_CharacterAvatarFromURL);
add_module(Mod_CharacterIO);
add_module(Mod_CharacterTokenModifier);

if(BUILD_CONSTANT_TARGET_PLATFORM === "chrome") {
  add_module(Mod_ChromeUpdateChecker);
}

if(BUILD_CONSTANT_TARGET_PLATFORM === "userscript") {
  add_module(Mod_UserscriptUpdateChecker);
}

add_module(Mod_CounterTokenName);
add_module(Mod_CustomPathWidth);
add_module(Mod_DisablePlayerDrawings);
add_module(Mod_DrawCurrentLayer);
add_module(Mod_DuplicateButton);
add_module(Mod_HandoutImageFromURL);
add_module(Mod_HidePlayerList);
add_module(Mod_InitiativeAdvanceShortcut);
add_module(Mod_JukeboxIO);
add_module(Mod_LibreAudio);
add_module(Mod_MacroGenerator);
add_module(Mod_MacroIO);
add_module(Mod_MiddleClickSelect);
add_module(Mod_MoveCameraToToken);
add_module(Mod_NightMode);
add_module(Mod_PerformanceImprovements);
add_module(Mod_RollAndApplyHitDice);
//add_module(Mod_ScaleTokenNamesBySize);
add_module(Mod_SetTableEntryAvatarByUrl);
add_module(Mod_ToolsMenu);
add_module(Mod_Settings);
add_module(Mod_SheetTabApi);
add_module(Mod_TableIO);
add_module(Mod_TokenBarPositionAdjust);
add_module(Mod_TokenFromImg);
add_module(Mod_TokenLayerDrawing);
add_module(Mod_TokenResize);
add_module(Mod_TransparentPaper);
add_module(Mod_Welcome);
add_module(Mod_TokenContextMenuApi);

export { VTTES_MODULES };
