import {R20Module} from "../../utils/R20Module"
import {DOM} from '../../utils/DOM'
import {R20} from "../../utils/R20";
import {EventSubscriber} from "../../utils/EventSubscriber";
import {scaleToFit} from "../../utils/FitWithinTools";
import {AnimBackgroundSetup} from "./AnimBackgroundSetup";

class AnimatedBackgroundLayer extends R20Module.OnAppLoadBase {
    private static readonly propVideoSource = "r20es_video_src";
    private static readonly propVideoEnabled = "r20es_video_enabled";

    private _isPlaying: boolean = false;
    private _videoCanvas: HTMLCanvasElement;
    private _videoCtx: CanvasRenderingContext2D;
    private _videoElement: HTMLVideoElement;

    private _originalResize: (width: number, height: number) => void;
    private _showSettingsWidget: HTMLElement;
    private _dialog: AnimBackgroundSetup;

    private _currentPage: Roll20.Page;

    private _events: EventSubscriber[] = [];

    constructor() {
        super(__dirname);
    }

    renderLoop = () => {
        if (this._videoCtx && this._isPlaying && this._currentPage) {

            R20.setBackgroundStyle("rgba(0,0,0,0)");

            const bbX = this._currentPage.attributes.width * 70;
            const bbY = this._currentPage.attributes.height * 70;

            const fitted = scaleToFit(this._videoElement.videoWidth, this._videoElement.videoHeight, bbX, bbY);

            this._videoCtx.drawImage(this._videoElement,
                -R20.getCanvasOffsetX(),
                -R20.getCanvasOffsetY(),
                fitted.x, fitted.y);

            // fill in the blanks
            const fillMaxX = Math.ceil(R20.getCanvasWidth() / R20.getCanvasZoom());
            const fillMaxY = R20.getCanvasHeight() / R20.getCanvasZoom();

            this._videoCtx.fillStyle = this._currentPage.attributes.background_color;
            this._videoCtx.fillRect(0, fitted.y - R20.getCanvasOffsetY(), fillMaxX, fillMaxY);
            this._videoCtx.fillRect(fitted.x - R20.getCanvasOffsetX(), 0, fillMaxX, fillMaxY);

            requestAnimationFrame(this.renderLoop);
        }
    };

    beginVideo() {
        console.log("video BEGIN VIDEO");

        this._isPlaying = true;

        this._videoCanvas.style.display = "block";

        this._videoElement.src = this.getVideoSrc();
        this._videoElement.play();

        this.onResizeCanvas(R20.getCanvasWidth(), R20.getCanvasHeight());
        this.onSetZoom(R20.getCanvasZoom());

        this.renderLoop();

        R20.setBackgroundStyle("rgba(0,0,0,0)");
        R20.renderAll();
    }

    endVideo() {
        console.log("video END VIDEO");
        this._isPlaying = false;

        this._videoCanvas.style.display = "none";

        this._videoElement.pause();
        this._videoElement.src = "";

        // reset background style
        if(this._currentPage) {
            R20.setBackgroundStyle(this._currentPage.attributes.background_color);
        }
        R20.renderAll();
    }

    onPropChange = () => {
        console.log("video ON {PROP CHANGE");

        this.endVideo();

        if (this.canPlayVideo()) {
            this.beginVideo();
        }
    };

    cleanupPage() {
        console.log("video CLEANUP PAGE");

        this.endVideo();

        for (const ev of this._events) {
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

    setVideoSrc = (source: string) => {
        return this._currentPage.save({
            [AnimatedBackgroundLayer.propVideoSource]: source,
        });
    };

    setVideoEnabled = (state: boolean) => {
        return this._currentPage.save({
            [AnimatedBackgroundLayer.propVideoEnabled]: state,
        });
    };

    canPlayVideo() {
        return this.getVideoSrc().length > 0 && this.getVideoEnabled();
    }

    initPage = () => {
        this.cleanupPage();

        console.log("video INITPAGE");

        const page = R20.getCurrentPage();

        const pageGetter = () => page;
        this._events = [
            EventSubscriber.subscribe(`change:${AnimatedBackgroundLayer.propVideoSource}`, this.onPropChange, pageGetter),
            EventSubscriber.subscribe(`change:${AnimatedBackgroundLayer.propVideoEnabled}`, this.onPropChange, pageGetter),
            EventSubscriber.subscribe(`change:height`, this.onPropChange, pageGetter),
            EventSubscriber.subscribe(`change:width`, this.onPropChange, pageGetter),
        ];

        this._currentPage = page;

        // reset background style
        R20.setBackgroundStyle(this._currentPage.attributes.background_color);
        R20.renderAll();

        if (this.canPlayVideo()) {
            this.beginVideo();
        }
    };

    onResizeCanvas = (width: number, height: number) => {
        if(this._isPlaying) {
            console.log("video RESIZE CANVAS", width, height);

            this._videoCanvas.width = width;
            this._videoCanvas.height = height;

            // fixes scale resets after resize
            this.onSetZoom(R20.getCanvasZoom());
        }
    };

    overrideSetCanvasSize = (width: number, height: number) => {
        this._originalResize(width, height);
        this.onResizeCanvas(width, height);
    };

    onSetZoom = (coef: number) => {
        if(this._isPlaying) {
            console.log("video SET ZOOM", coef);

            this._videoCtx.restore();
            this._videoCtx.save();

            this._videoCtx.scale(coef, coef);
        }
    };

    showConfigurationDialog = () => {
        this._dialog.show(this.getVideoSrc(), this.getVideoEnabled(), this.setVideoSrc, this.setVideoEnabled);
    };

    onSettingChange(name: string, oldVal: any, newVal: any) {
        if(name === "muteAudio" && this._videoElement) {
            this._videoElement.muted = newVal;
        }

        if(name === "audioVolume" && this._videoElement) {
            this.setVolume(newVal);
        }
    }

    setVolume(newVolume: number) {
        if(!this._videoElement) return;

        try {
            this._videoElement.volume = newVolume;
        } catch(e) {
            this._videoElement.volume = 0.1;
        }
    }

    setup() {
        console.log("video before ==================================");

        const cfg = this.getHook().config;

        this._videoCanvas = <canvas/>;

        this._videoElement = <video loop={true} autoplay={true} muted={cfg.muteAudio}/>;
        this.setVolume(cfg.audioVolume);

        this._videoCtx = this._videoCanvas.getContext("2d");
        this._videoCtx.save();

        const beforeRoot = $("#maincanvas")[0];

        beforeRoot.parentNode.insertBefore(this._videoCanvas, beforeRoot);

        this._originalResize = window.d20.engine.setCanvasSize;
        window.d20.engine.setCanvasSize = this.overrideSetCanvasSize;

        window.r20es.onZoomChange = this.onSetZoom;
        window.r20es.onResizeCanvas = this.onResizeCanvas;

        this.initPage();
        window.r20es.onPageChange.on(this.initPage);


        if(R20.isGM())
        {
            this._showSettingsWidget = (
                <div title="Animated Background Setup (R20ES)" style={{cursor: "pointer", position: "absolute", top: "0", left: "5%", maxWidth: "32px", maxHeight: "32px", zIndex: "10", backgroundColor: "#e18e42", borderRadius: "2px"}}
                     onClick={this.showConfigurationDialog}
                >
                    <img src="https://github.com/encharm/Font-Awesome-SVG-PNG/raw/master/black/png/32/film.png" width="28" height="28" alt="ANIM"/>
                </div>
            );

            document.body.appendChild(this._showSettingsWidget);
            console.log(this._showSettingsWidget);
        }

        this._dialog = new AnimBackgroundSetup();
    }

    dispose() {
        super.dispose();

        this.cleanupPage();

        window.d20.engine.setCanvasSize = this._originalResize;

        window.r20es.onZoomChange = null;
        window.r20es.onResizeCanvas = null;

        this._showSettingsWidget.remove();
        this._showSettingsWidget = null;

        this._dialog.dispose();

        if (this._videoCanvas) {
            this._videoCtx = null;
            this._videoCanvas.remove();
            this._videoCanvas = null;
        }

        if (this._videoElement) {
            this._videoElement.remove();
            this._videoElement = null;
        }

        window.r20es.onPageChange.off(this.initPage);
    }
}

if (R20Module.canInstall()) new AnimatedBackgroundLayer().install();
