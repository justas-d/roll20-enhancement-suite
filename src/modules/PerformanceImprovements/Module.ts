import {R20Module} from '../../utils/R20Module'

class PerformanceImprovements extends R20Module.OnAppLoadBase {

    constructor() {
        super(__dirname);
    }

    toggle_frame_recorder = (true_if_on: boolean) => {
        try {
            if(window.d20.engine.frame_recorder) {
                window.d20.engine.frame_recorder.clear();

                if (true_if_on) {
                    window.d20.engine.frame_recorder.startup()
                }
                else {
                    window.d20.engine.frame_recorder.shutdown();
                }
            }
        }catch(e) {
            console.error(e);
        }
    };

    private onSettingChange = (key, oldVal, value) => {
        if (key === "disable_frame_recorder") {
            this.toggle_frame_recorder(!value);
        }
    };

    public setup() {
        const config = this.getHook().config;
        this.toggle_frame_recorder(!config["disable_frame_recorder"]);
    }

    public dispose() {
        this.toggle_frame_recorder(true);
    }
}

export default () => {
  new PerformanceImprovements().install();
};

