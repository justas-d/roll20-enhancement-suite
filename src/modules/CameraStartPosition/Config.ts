import MakeConfig from '../MakeConfig'; 
import Category from '../Category';
import ConfigViews from '../../utils/ConfigViews';

export default MakeConfig(__dirname, {
    id: "cameraStartPosition",
    name: "Default Camera Starting Position",
    description: "Allows GMs to set the default camera start position to a custom location on the map so that players will see that area first. Players MUST have the extension installed for this to work for them.",
    category: Category.canvas,

    media: {
      "default_camera_ui.png": "Setup UI.",
    },

    config: {
      send_local_event_messages: true,
      move_if_gm: true,
    },

    configView: {
      send_local_event_messages: {
        display: "Send local system messages for when you toggle/use the default camera",
        type: ConfigViews.Checkbox,
      },
      move_if_gm: {
        display: "Set the default camera on map load even if you're the GM.",
        type: ConfigViews.Checkbox,
      },
    },
});
