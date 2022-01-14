import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "libreAudio",
  name: "Libre Audio",
  description: "Allows creation and playback of tracks via their URL. Removes the 16 listener cap on My Audio Tracks. Refreshing the page is recommended after disabling/enabling this module in order to avoid issues.",
  category: VTTES.Module_Category.freedom,
  gmOnly: false,

  media: {
    "libre_audio.png": "Add by URL button",
  },

  mods: [

    // play libreaudio sounds
    {
      includes: "vtt.bundle.js",
      find: `\`/audio_library/play/\${campaign_id}/\${V.split("-")[0]}\``,

      patch: `((window.r20es && window.r20es.canPlaySound && window.r20es.canPlaySound(M)) ? V : >>R20ES_MOD_FIND>>)`,

      stability_checks: [
        `if(M.get("playing")&&M.get("softstop")==!1)`,
      ],
    },
    {
      includes: "vtt.bundle.js",
      find: `d20.Campaign.players.filter(j=>j.get("online")).length>15`,
      patch: "false",
    }
  ]
};
