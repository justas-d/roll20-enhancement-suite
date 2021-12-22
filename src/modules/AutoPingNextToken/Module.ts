import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";

class AutoPingNextTokenModule extends R20Module.SimpleBase {
  public constructor() {
    super(__dirname);
  }

  private static ping(data: Roll20.Token) {
    if (!data.id) return;

    const obj = R20.getCurrentPageTokenByUUID(data.id);

    if (!obj) return;

    const model = R20.try_get_canvas_object_model(obj);
    if(!model) {
      return;
    }

    if (model.get("layer") !== "objects") {
      return;
    }

    R20.ping(obj.left, obj.top, null, null, R20.CanvasLayer.PlayerTokens);
  }

  public setup() {
    if (!R20.isGM()) return;

    window.r20es.pingInitiativeToken = AutoPingNextTokenModule.ping;
  }

  public dispose() {
    window.r20es.pingInitiativeToken = null;
  }
}

export default () => {
  new AutoPingNextTokenModule().install();
};

