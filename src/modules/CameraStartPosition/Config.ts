import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "cameraStartPosition",
  name: "Default Camera Starting Position",
  description: "Allows GMs to set the default camera start position to a custom location on the map so that players will see that area first. Players MUST have the extension installed for this to work for them.",
  category: VTTES.Module_Category.canvas,
  gmOnly: false,

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
      type: VTTES.Config_View_Type.Checkbox,
    },
    move_if_gm: {
      display: "Set the default camera on map load even if you're the GM.",
      type: VTTES.Config_View_Type.Checkbox,
    },
  },
};
