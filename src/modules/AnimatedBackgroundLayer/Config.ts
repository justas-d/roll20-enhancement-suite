import MakeConfig from '../MakeConfig';
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
  id: "animatedBackground",
  name: "Animated Background",
  description: "Displays an animated background if the GM has one set up for the page. Setup can be found in the top-right corner, look for a orange film button.",
  category: Category.canvas,

  media: {
    "animated_bg.webm": "Setup & usage"
  },

  config: {
    muteAudio: false,
    audioVolume: 0.1,
    video_history: []
  },

  configView: {
    muteAudio: {
      display: "Mute Audio?",
      type: ConfigViews.Checkbox
    },

    audioVolume: {
      display: "Audio Volume",
      type: ConfigViews.Slider,
      sliderMin: 0,
      sliderMax: 1,
    }
  },

  mods: [
    {
      includes: "vtt.bundle.js",
      find: `updateCanvasZoom:()=>d20.engine.canvasZoom=z.canvasZoom`,

      patch: `updateCanvasZoom:()=> {
        if(window.r20es && window.r20es.onZoomChange) {
          window.r20es.onZoomChange(A);
        }
        d20.engine.canvasZoom = z.canvasZoom;
      }`,
    }
  ]
});
