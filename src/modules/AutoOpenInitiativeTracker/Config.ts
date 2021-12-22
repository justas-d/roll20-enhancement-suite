import { DIALOG_OPEN_DELAY_KEY } from "./Constants";
import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "autoOpenInitiativeTracker",
  name: "Open Turn Tracker On Initiative",
  description: "Automatically opens the turn tracker when somebody rolls initiative.",
  category: VTTES.Module_Category.initiative,
  gmOnly: true,

  configView: {
    [DIALOG_OPEN_DELAY_KEY]: {
      display: "Delay between opening the initiative dialog in milliseconds (low values may cause issues)",
      type: VTTES.Config_View_Type.Number
    },
  },

  config: {
    [DIALOG_OPEN_DELAY_KEY]: 500,
  },
}
