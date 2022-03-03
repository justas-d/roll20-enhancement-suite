window.enhancementSuiteEnabled = true;
console.log(`Set window.enhancementSuiteEnabled to ${window.enhancementSuiteEnabled}`);

// @SprigWorkaround
window.sprig_safe_trampoline = (...args) => {
  try {
    window.Sprig(...args);
  } catch(ex) {
  }
}
console.log("Installed sprig_safe_trampoline");

