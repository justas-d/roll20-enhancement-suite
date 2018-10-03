import AlternativeRadialMenu from './modules/AlternativeRadialMenu/Config'
import AnimationDisable from './modules/AnimationDisable/Config'
import AutoPingNextToken from './modules/AutoPingNextToken/Config'
import AutoSelectNextToken from './modules/AutoSelectNextToken/Config'
import AutoSortInitiative from './modules/AutoSortInitiative/Config'
import BulkMacro from './modules/BulkMacro/Config'
import ChangeIdWhenDuplicating from './modules/ChangeIdWhenDuplicating/Config'
import CharacterIO from './modules/CharacterIO/Config'
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

let configs = {};
const addCfg = cfg => configs[cfg.id] = cfg;

addCfg(AlternativeRadialMenu);
addCfg(AlternatePageToolbarMenu);
addCfg(AnimationDisable);
addCfg(AutoPingNextToken);
addCfg(AutoSelectNextToken);
addCfg(AutoSortInitiative);
addCfg(BulkMacro);
addCfg(ChangeIdWhenDuplicating);
addCfg(CharacterIO);
addCfg(NightMode);
addCfg(DrawCurrentLayer);
addCfg(DuplicateButton);
addCfg(ExposeD20);
addCfg(InitiativeAdvanceShortcut);
addCfg(MacroGenerator);
addCfg(CharacterTokenModifier);
addCfg(MacroIO);
addCfg(MiddleClickSelect);
addCfg(MoveCameraToToken);
addCfg(PageLoadEvent);
addCfg(RollAndApplyHitDice);
addCfg(Settings);
addCfg(SheetTabApi);
addCfg(SeenAd);
addCfg(TableIO);
addCfg(TokenResize);
addCfg(TokenContextMenuApi);
addCfg(TokenLayerDrawing);
addCfg(TransparentPaper);
addCfg(HidePlayerList);
addCfg(Welcome);

export default configs;
