import {IToolConfig} from "./ITool";
import SheetRollTypeSetter from "./SheetRollTypeSetter/Config";

const tools: {[id: string]: IToolConfig} = {};
const addTool = (tool: IToolConfig) => tools[tool.id] = tool;

addTool(SheetRollTypeSetter);

export default tools;
