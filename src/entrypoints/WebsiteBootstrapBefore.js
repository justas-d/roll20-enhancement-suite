import {initializeDefaultLogWrapperOrReusePreviousInThisContext} from "../utils/LogWrapper";

initializeDefaultLogWrapperOrReusePreviousInThisContext();

window.enhancementSuiteEnabled = true;
console.log(`Set window.enhancementSuiteEnabled to ${window.enhancementSuiteEnabled}`);
