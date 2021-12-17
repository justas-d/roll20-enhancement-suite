import MakeConfig from '../MakeConfig';
import Category from '../Category';

export default MakeConfig(__dirname, {
  id: "libreAudio",
  name: "Libre Audio",
  description: "Allows creation and playback of tracks via their URL. Removes the 16 listener cap on My Audio Tracks. Refreshing the page is recommended after disabling/enabling this module in order to avoid issues.",
  category: Category.freedom,

  media: {
    "libre_audio.png": "Add by URL button",
  },

  mods: [

    // play libreaudio sounds
    {
      includes: "vtt.bundle.js",
      find: `\`/audio_library/play/\${campaign_id}/\${D.split("-")[0]}\``,
      patch: `((window.r20es && window.r20es.canPlaySound && window.r20es.canPlaySound(k)) ? D : >>R20ES_MOD_FIND>>)`,
    },
    {
      includes: "vtt.bundle.js",
      find: `d20.Campaign.players.filter(se=>se.get("online")).length>15`,
      patch: "false",
    }
  ]
});

