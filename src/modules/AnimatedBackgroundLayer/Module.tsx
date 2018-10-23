import {R20Module} from "../../utils/R20Module"
import { DOM } from '../../utils/DOM'
import {findByIdAndRemove} from "../../utils/MiscUtils";
import {R20} from "../../utils/R20";
import {EventSubscriber} from "../../utils/EventSubscriber";

class AnimatedBackgroundLayer extends R20Module.OnAppLoadBase {

    private static readonly layerId: string = "r20es-animated-background";
    private static readonly videoId: string = "r20es-animated-background-video";
    private static readonly propVideoSource = "r20es_video_src";
    private static readonly propVideoEnabled = "r20es_video_enabled";

    private _renderLoopShouldStopFlag: boolean = false;
    private _videoCanvas: HTMLCanvasElement;
    private _videoCtx: CanvasRenderingContext2D;
    private _videoElement: HTMLVideoElement;

    private _originalResize: (width: number, height: number) => void;

    private _currentPage: Roll20.Page;

    private _events: EventSubscriber[] = [];

    constructor() {
        super(__dirname);
    }

    renderLoop = () => {
        this._videoCtx.drawImage(this._videoElement,
            -window.d20.engine.currentCanvasOffset[0],
            -window.d20.engine.currentCanvasOffset[1],
            window.d20.engine.canvas.width,
            window.d20.engine.canvas.height);

        R20.setBackgroundStyle("#00000000");

        if (!this._renderLoopShouldStopFlag) {
            requestAnimationFrame(this.renderLoop);
        }
    };

    beginVideo() {
        console.log("video BEGIN VIDEO");

        this._renderLoopShouldStopFlag = false;
        this._videoElement.src = this.getVideoSrc();

        this.renderLoop();
        R20.renderAll();
    }

    endVideo() {
        console.log("video END VIDEO");
        this._renderLoopShouldStopFlag = true;
        this._videoElement.pause();
    }

    onPropChange() {
        console.log("video ON {PROP CHANGE");
        this.endVideo();

        if (this.canPlayVideo()) {
            this.beginVideo();
        }
    }

    cleanupPage() {
        console.log("video CLEANUP PAGE");

        for(const ev of this._events) {
            ev.unsubscribe();
        }
    }

    getVideoSrc(): string {
        const val = this._currentPage.attributes[AnimatedBackgroundLayer.propVideoSource];
        if (typeof val !== "string") return "";
        return val;
    }

    getVideoEnabled(): boolean {
        const val = this._currentPage.attributes[AnimatedBackgroundLayer.propVideoEnabled];
        if (typeof val !== "boolean") return false;
        return val;
    }

    setVideoSrc(source: string) {
        return this._currentPage.save({
            [AnimatedBackgroundLayer.propVideoSource]: source,
        });
    }

    setVideoEnabled(state: boolean) {
        return this._currentPage.save({
            [AnimatedBackgroundLayer.propVideoEnabled]: state,
        });
    }

    canPlayVideo() {
        return this.getVideoSrc().length > 0 && this.getVideoEnabled();
    }

    initPage = () => {
        console.log("video INITPAGE");

        this.endVideo();
        this.cleanupPage();

        const page = R20.getCurrentPage();

        const pageGetter= () => page;
        this._events = [
            EventSubscriber.subscribe(`change`, this.onPropChange, pageGetter),
            //EventSubscriber.subscribe(`change:${AnimatedBackgroundLayer.propVideoSource}`, this.onPropChange, pageGetter),
            //EventSubscriber.subscribe(`change:${AnimatedBackgroundLayer.propVideoEnabled}`, this.onPropChange, pageGetter),
        ];

        this._currentPage = page;

        this.onResizeCanvas(window.d20.engine.canvas.width, window.d20.engine.canvas.height);

        if (this.canPlayVideo()) {
            this.beginVideo();
        }
    };

    onResizeCanvas = (width: number, height: number) => {
        console.log("video RESIZE CANVAS", width, height);
        this._videoCanvas.width = width;
        this._videoCanvas.height = height;
    };

    overrideSetCanvasSize = (width: number, height: number) => {
        this._originalResize(width, height);
        this.onResizeCanvas(width, height);
    };

    onSetZoom = (coef: number) => {
        this._videoCtx.restore();
        this._videoCtx.scale(coef, coef);
        console.log("video ZOOM CANVAS", coef);
    };

    setup() {
        /*
            TODO
                Disable background clearing
                Disable grid
                UI
         */

        this._videoCanvas= <canvas id={AnimatedBackgroundLayer.layerId}/>;
        this._videoElement = <video id={AnimatedBackgroundLayer.videoId} loop={true} autoplay={true} muted={true}/>;
        this._videoCtx = this._videoCanvas.getContext("2d");
        this._videoCtx.save();

        const beforeRoot = $("#maincanvas")[0];

        beforeRoot.parentNode.insertBefore(this._videoCanvas, beforeRoot);

        this._originalResize = window.d20.engine.setCanvasSize;
        window.d20.engine.setCanvasSize = this.overrideSetCanvasSize;

        window.r20es.onZoomChange = this.onSetZoom;
        window.r20es.onResizeCanvas = this.onResizeCanvas;

        if (window.r20es.isWindowLoaded) {
            window.r20es.onPageChange.on(this.initPage);
        } else {
            this.initPage();
        }
    }

    dispose() {
        super.dispose();
        this.cleanupPage();

        window.d20.engine.setCanvasSize = this._originalResize;

        window.r20es.onZoomChange = null;
        window.r20es.onResizeCanvas = null;

        findByIdAndRemove(AnimatedBackgroundLayer.layerId);
        findByIdAndRemove(AnimatedBackgroundLayer.videoId);

        window.r20es.onPageChange.off(this.initPage);
    }
}

if (R20Module.canInstall()) new AnimatedBackgroundLayer().install();
