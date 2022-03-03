import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "sprigWorkaround",
  name: "Sprig Crash Workaround",
  description: "",
  category: VTTES.Module_Category.misc,
  force: true,

  mods: [
    {
      includes: "vtt.bundle.js",
      find_replace: [
        // NOTE(justasd): In the instance that a person has '*://cdn.userleap.com/*' blocked, Roll20
        // will just not load as there's a crash somewhere in the loading pipeline during a call to
        // Sprig. Roll20 doesn't recover from that
        // @SprigWorkaround
        {
          find: `Sprig(`,
          replace: `(window.sprig_safe_trampoline ? window.sprig_safe_trampoline : Sprig)(`,
        },
      ],
    },
  ],
};
