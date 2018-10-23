import {R20Module} from "../../utils/R20Module"
import { DOM } from '../../utils/DOM'
import {findByIdAndRemove} from "../../utils/MiscUtils";
import {R20} from "../../utils/R20";

class AnimatedBackgroundLayer extends R20Module.OnAppLoadBase {

    private static readonly layerId: string = "r20es-animated-background";
    private static readonly videoId: string = "r20es-animated-background-video";
    private static readonly propVideoSource = "r20es_video_src";
    private static readonly propVideoEnabled = "r20es_video_enabled";

    private _renderLoopShouldStopFlag: boolean = false;
    private _videoCtx: CanvasRenderingContext2D;
    private _videoElement: HTMLVideoElement;

    constructor() {
        super(__dirname);
    }

    renderLoop = () => {
        this._videoCtx.drawImage(this._videoElement,
            -window.d20.engine.currentCanvasOffset[0],
            -window.d20.engine.currentCanvasOffset[1],
            window.d20.engine.canvas.width,
            window.d20.engine.canvas.height);

        if (!this._renderLoopShouldStopFlag) {
            requestAnimationFrame(this.renderLoop);
        }
    };

    beginVideo() {
        console.log("video BEGIN VIDEO");
        this._renderLoopShouldStopFlag = false;
        this._videoElement.src = AnimatedBackgroundLayer.getVideoSrc(R20.getCurrentPage());
        this.renderLoop();
    }

    endVideo() {
        console.log("video END VIDEO");
        this._renderLoopShouldStopFlag = true;
    }

    onPropChange() {
        console.log("video ON {PROP CHANGE");
        this.endVideo();

        if (AnimatedBackgroundLayer.canPlayVideo(R20.getCurrentPage())) {
            this.beginVideo();
        }
    }

    cleanupPage() {
        console.log("video CLEANUP PAGE");
        const page = R20.getCurrentPage();

        page.off(`change:${AnimatedBackgroundLayer.propVideoSource}`, this.onPropChange);
        page.off(`change:${AnimatedBackgroundLayer.propVideoEnabled}`, this.onPropChange);
    }

    static getVideoSrc(page: Roll20.Page): string {
        const val = page.attributes[AnimatedBackgroundLayer.propVideoSource];
        if (typeof val !== "string") return "";
        return val;
    }

    static getVideoEnabled(page: Roll20.Page): boolean {
        const val = page.attributes[AnimatedBackgroundLayer.propVideoEnabled];
        if (typeof val !== "boolean") return false;
        return val;
    }

    static setVideoSrc(page: Roll20.Page, source: string) {
        return page.save({
            [AnimatedBackgroundLayer.propVideoSource]: source,
        });
    }

    static setVideoEnabled(page: Roll20.Page, state: boolean) {
        return page.save({
            [AnimatedBackgroundLayer.propVideoEnabled]: state,
        });
    }

    static canPlayVideo(page: Roll20.Page) {
        return AnimatedBackgroundLayer.getVideoSrc(page).length > 0 && AnimatedBackgroundLayer.getVideoEnabled(page);
    }

    initPage = () => {
        console.log("video INITPAGE");
        const page = R20.getCurrentPage();
        page.on(`change:${AnimatedBackgroundLayer.propVideoSource}`, this.onPropChange);
        page.on(`change:${AnimatedBackgroundLayer.propVideoEnabled}`, this.onPropChange);

        if (AnimatedBackgroundLayer.canPlayVideo(page)) {
            this.beginVideo();
        }
    };

    setup() {
        /*
            TODO
                Disable background clearing
                Disable grid
                UI
                d20.engine.setCanvasSize
         */

        const canvas = <canvas id={AnimatedBackgroundLayer.layerId}/>;
        this._videoElement = <video id={AnimatedBackgroundLayer.videoId} loop={true} autoplay={true} muted={true}/>;
        this._videoCtx = canvas.getContext("2d");

        const beforeRoot = $("#maincanvas")[0];

        beforeRoot.parentNode.insertBefore(canvas, beforeRoot);

        if (window.r20es.isWindowLoaded) {
            window.r20es.onPageChange.on(this.initPage);
        } else {
            this.initPage();
        }
    }

    dispose() {
        super.dispose();
        this.cleanupPage();

        findByIdAndRemove(AnimatedBackgroundLayer.layerId);
        findByIdAndRemove(AnimatedBackgroundLayer.videoId);

        window.r20es.onPageChange.off(this.initPage);
    }
}

if (R20Module.canInstall()) new AnimatedBackgroundLayer().install();
