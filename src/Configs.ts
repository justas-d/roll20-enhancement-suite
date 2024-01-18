import AlternativeRadialMenu from './modules/AlternativeRadialMenu/Config'
import AnimationDisable from './modules/AnimationDisable/Config'
import AutoPingNextToken from './modules/AutoPingNextToken/Config'
import AutoSelectNextToken from './modules/AutoSelectNextToken/Config'
import AutoSortInitiative from './modules/AutoSortInitiative/Config'
import BulkMacro from './modules/BulkMacro/Config'
import ChangeIdWhenDuplicating from './modules/ChangeIdWhenDuplicating/Config'
import CharacterIO from './modules/CharacterIO/Config'
import CounterTokenName from './modules/CounterTokenName/Config'
import DrawCurrentLayer from './modules/DrawCurrentLayer/Config'
import DuplicateButton from './modules/DuplicateButton/Config'
import ExposeD20 from './modules/ExposeD20/Config'
import InitiativeAdvanceShortcut from './modules/InitiativeAdvanceShortcut/Config'
import MacroGenerator from './modules/MacroGenerator/Config'
import MacroIO from './modules/MacroIO/Config'
import MiddleClickSelect from './modules/MiddleClickSelect/Config'
import MoveCameraToToken from './modules/MoveCameraToToken/Config'
import PageLoadEvent from './modules/PageLoadEvent/Config'
import RollAndApplyHitDice from './modules/RollAndApplyHitDice/Config'
import Settings from './modules/Settings/Config'
import SheetTabApi from './modules/SheetTabApi/Config'
import TableIO from './modules/TableIO/Config'
import TokenContextMenuApi from './modules/TokenContextMenuApi/Config'
import TokenLayerDrawing from './modules/TokenLayerDrawing/Config'
import TransparentPaper from './modules/TransparentPaper/Config'
import Welcome from './modules/Welcome/Config'
import AlternatePageToolbarMenu from './modules/AlternatePageToolbarMenu/Config'
import TokenResize from "./modules/TokenResize/Config"
import HidePlayerList from "./modules/HidePlayerList/Config";
import CharacterTokenModifier from "./modules/CharacterTokenModifier/Config";
import SeenAd from "./modules/SeenAd/Config";
import NightMode from "./modules/NightMode/Config";
import JukeboxIO from "./modules/JukeboxIO/Config";
import ArrowKeysMoveCanvas from "./modules/ArrowKeysMoveCanvas/Config";
import AutoOpenInitiativeTracker from "./modules/AutoOpenInitiativeTracker/Config";
import ToolsMenu from "./modules/ToolsMenu/Config";
//import ScaleTokenNamesBySize from "./modules/ScaleTokenNamesBySize/Config";
import AnimatedBackgroundLayer from "./modules/AnimatedBackgroundLayer/Config";
import AdjustableOpacity from "./modules/AdjustableOpacity/Config";
import TokenFromImg from "./modules/TokenFromImg/Config";
import DisablePlayerDrawings from "./modules/DisablePlayerDrawings/Config";
import SetTableEntryAvatarByUrl from "./modules/SetTableEntryAvatarByUrl/Config";
import LibreAudio from "./modules/LibreAudio/Config";
import TokenBarPositionAdjust from "./modules/TokenBarPositionAdjust/Config"
import PerformanceImprovements from "./modules/PerformanceImprovements/Config"
import ChromeUpdateChecker from "./modules/ChromeUpdateChecker/Config"
import WebpackFixes from "./modules/WebpackFixes/Config"
import CharacterAvatarFromURL from "./modules/CharacterAvatarFromURL/Config"
import CameraStartPosition from "./modules/CameraStartPosition/Config"
import HandoutImageFromURL  from "./modules/HandoutImageFromURL/Config"
import CustomPathWidth from "./modules/CustomPathWidth/Config"
import FixPatienceJs from "./modules/FixPatienceJs/Config"
import UserscriptUpdateChecker from "./modules/UserscriptUpdateChecker/Config"

const VTTES_MODULE_CONFIGS: Record<string, VTTES.Module_Config> = {};
const addCfg = (cfg: VTTES.Module_Config) => VTTES_MODULE_CONFIGS[cfg.id] = cfg;

addCfg(DisablePlayerDrawings);
addCfg(TokenBarPositionAdjust);
addCfg(LibreAudio);
addCfg(TokenFromImg);
addCfg(AdjustableOpacity);
addCfg(AnimatedBackgroundLayer);
addCfg(AutoOpenInitiativeTracker);
addCfg(AlternativeRadialMenu);
addCfg(ArrowKeysMoveCanvas);
addCfg(AlternatePageToolbarMenu);
addCfg(AnimationDisable);
addCfg(AutoPingNextToken);
addCfg(AutoSelectNextToken);
addCfg(AutoSortInitiative);
addCfg(BulkMacro);
addCfg(ToolsMenu);
addCfg(CounterTokenName);
addCfg(ChangeIdWhenDuplicating);
addCfg(CharacterIO);
addCfg(NightMode);
addCfg(DrawCurrentLayer);
addCfg(DuplicateButton);
addCfg(ExposeD20);
addCfg(InitiativeAdvanceShortcut);
addCfg(JukeboxIO);
addCfg(MacroGenerator);
addCfg(CharacterTokenModifier);
addCfg(MacroIO);
addCfg(MiddleClickSelect);
addCfg(MoveCameraToToken);
addCfg(PageLoadEvent);
addCfg(RollAndApplyHitDice);
addCfg(Settings);
//addCfg(ScaleTokenNamesBySize);
addCfg(SheetTabApi);
addCfg(SeenAd);
addCfg(TableIO);
addCfg(TokenResize);
addCfg(TokenContextMenuApi);
addCfg(TokenLayerDrawing);
addCfg(TransparentPaper);
addCfg(HidePlayerList);
addCfg(SetTableEntryAvatarByUrl);
addCfg(PerformanceImprovements);
addCfg(CharacterAvatarFromURL);
addCfg(CameraStartPosition);
addCfg(HandoutImageFromURL);
addCfg(CustomPathWidth);

if(BUILD_CONSTANT_TARGET_PLATFORM === "userscript" ||
   BUILD_CONSTANT_TARGET_PLATFORM === "chrome" 
) {
  addCfg(FixPatienceJs);
  addCfg(WebpackFixes);
}

if(BUILD_CONSTANT_TARGET_PLATFORM === "chrome") {
  addCfg(ChromeUpdateChecker);
}

if(BUILD_CONSTANT_TARGET_PLATFORM === "userscript") {
  addCfg(UserscriptUpdateChecker);
}

addCfg(Welcome);

export { VTTES_MODULE_CONFIGS };

