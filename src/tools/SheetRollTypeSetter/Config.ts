import {SheetRollTypeSetter} from "./index";
import {ITool, IToolConfig} from "../ITool";

const cfg: IToolConfig = {
    id: "sheetRollTypeSetterTool",
    description: "Allows bulk changing 5e OGL sheet roll queries, whisper types and damage auto roll settings.",
    name: "Bulk 5e OGL Roll type setter",

    factory: (): ITool => {
        return new SheetRollTypeSetter();
    },
};

export default cfg;
