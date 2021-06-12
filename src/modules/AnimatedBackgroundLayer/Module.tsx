import {R20Module} from "../../utils/R20Module"
import {R20} from "../../utils/R20";
import {DOM} from "../../utils/DOM";
import {CommonStyle} from "../../utils/CommonStyle";
import {EventSubscriber} from "../../utils/EventSubscriber";
import {scaleToFit} from "../../utils/FitWithinTools";
import {isChromium} from "../../utils/BrowserDetection";
import {DialogBase} from "../../utils/DialogBase";
import {
    Dialog,
    DialogBody,
    DialogFooter,
    DialogFooterContent,
    DialogHeader
} from "../../utils/DialogComponents";
import {removeByReference} from "../../utils/ArrayUtils";
import {nearly_format_file_url} from "../../utils/MiscUtils";
import {Optional} from "../../utils/TypescriptUtils";

interface BaseAnimRunner {
    render_frame: (page: Roll20.Page, canvas: HTMLCanvasElement, roll20Canvas: HTMLCanvasElement, time: number) => boolean;
    init: (cfg: any, canvas: HTMLCanvasElement) => void;
    start: (page: Roll20.Page, canvas: HTMLCanvasElement) => void;
    end: (canvas: HTMLCanvasElement) => void;
    can_play: (page: Roll20.Page) => boolean;
    on_setting_change: (name: string, oldVal: any, newVal: any) => void;
    on_zoom: (coef: number) => void;
    dispose: () => void;
}

class AnimBgUtils {

    static get_main_canvas = (): Optional<HTMLCanvasElement> => {
        const beforeRoot = ($(`#maincanvas`)[0] || $(`#finalcanvas`)[0]) as HTMLCanvasElement;
        if (!beforeRoot) {
            console.error(`[AnimatedBackgrounds] could not find beforeRoot!`);
        }
        return beforeRoot;
    };

    static get_canvas_root_size = (child: HTMLCanvasElement = undefined): {x: number, y: number} => {
        if(!child) {
            child = AnimBgUtils.get_main_canvas();
        }

        if(!child) {
            return {x: 0, y: 0};
        }
        const parent = child.parentElement;

        return {
            x: parseInt(parent.style.width.replace("px", "")),
            y: parseInt(parent.style.height.replace("px", "")),
        }
    };

    static is_anim_enabled = (page: Roll20.Page): boolean => {
        const val = page.attributes[AnimatedBackgroundLayer.propVideoEnabled];
        if (typeof val !== "boolean") return false;
        return val;
    };

    static set_anim_enabled = (page: Roll20.Page, state: boolean): void => {
        page.save({
            [AnimatedBackgroundLayer.propVideoEnabled]: state,
        });
    };

    static get_video_source(page: Roll20.Page): string {
        const val = page.attributes[AnimatedBackgroundLayer.propVideoSource];
        if (typeof val !== "string") return "";
        return val;
    }

    static set_video_source = (page: Roll20.Page, source: string) => {
        return page.save({
            [AnimatedBackgroundLayer.propVideoSource]: source,
        });
    };
}

class VideoRunner implements BaseAnimRunner {
    ctx: CanvasRenderingContext2D;
    video: HTMLVideoElement;

    on_setting_change = (name: string, oldVal: any, newVal: any): void => {
        if (name === "muteAudio" && this.video) {
            this.video.muted = newVal;
        }

        if (name === "audioVolume" && this.video) {
            this.set_volume(newVal);
        }
    };

    on_zoom = (coef: number): void => {
        console.log("video SET ZOOM", coef);

        if(this.ctx) {
            this.ctx.restore();
            this.ctx.save();
            this.ctx.scale(coef, coef);
        }
    };

    init = (cfg: any, canvas: HTMLCanvasElement) => {
        this.ctx = canvas.getContext("2d");
        this.ctx.save();

        this.video = <video loop={true} autoplay={true} muted={cfg.muteAudio}/>;
        this.set_volume(cfg.audioVolume);
    };

    set_volume(newVolume: number) {
        if (!this.video) {
            return;
        }

        try {
            this.video.volume = newVolume;
        } catch (e) {
            this.video.volume = 0.1;
        }
    }

    can_play = (page: Roll20.Page) => {
        return AnimBgUtils.get_video_source(page).length > 0 && AnimBgUtils.is_anim_enabled(page);
    };

    render_frame = (page: Roll20.Page, canvas: HTMLCanvasElement, roll20Canvas: HTMLCanvasElement, time: number): boolean => {

        if(this.ctx && this.video) {
            const bbX = page.attributes.width * 70;
            const bbY = page.attributes.height * 70;

            const fitted = scaleToFit(this.video.videoWidth, this.video.videoHeight, bbX, bbY);

            this.ctx.drawImage(this.video,
                -R20.getCanvasOffsetX(),
                -R20.getCanvasOffsetY(),
                fitted.x, fitted.y);

            // fill in the blanks
            const fillMaxX = Math.ceil(R20.getCanvasWidth() / R20.getCanvasZoom());
            const fillMaxY = R20.getCanvasHeight() / R20.getCanvasZoom();

            this.ctx.fillStyle = page.attributes.background_color;
            this.ctx.fillRect(0, fitted.y - R20.getCanvasOffsetY(), fillMaxX, fillMaxY);
            this.ctx.fillRect(fitted.x - R20.getCanvasOffsetX(), 0, fillMaxX, fillMaxY);

            return true;
        }
        return false;
    };

    start = (page: Roll20.Page, canvas: HTMLCanvasElement) => {
        this.video.src = AnimBgUtils.get_video_source(page);
        this.video.play();
    };

    end = (canvas: HTMLCanvasElement) => {
        canvas.style.display = "none";

        this.video.pause();
        this.video.src = "";
    };

    dispose = () => {
        if(this.ctx) this.ctx = null;
        if(this.video) this.video = null;
    }
}

class AnimatedBackgroundLayer extends R20Module.OnAppLoadBase {
    static readonly propVideoSource = "r20es_video_src";
    static readonly propVideoEnabled = "r20es_video_enabled";

    private _isPlaying: boolean = false;
    private canvas: HTMLCanvasElement;
    roll20Canvas: HTMLCanvasElement;

    private _originalResize: (width: number, height: number) => void;
    private _showSettingsWidget: HTMLElement;
    private _dialog: AnimBackgroundSetup;

    private current_page: Roll20.Page;

    private _events: EventSubscriber[] = [];
    private current_runner:  BaseAnimRunner;

    constructor() {
        super(__dirname);
    }

    render_loop = (time: number) => {
        if (this._isPlaying && this.current_page && this.current_runner) {
            if(this.current_runner.render_frame(this.current_page, this.canvas, this.roll20Canvas, time)) {
                requestAnimationFrame(this.render_loop);
            }
        }
    };

    err_report_missing_current_runner_in(where: string) {
      console.log(`[${where}]: current_runner is null, bailing.`);
    }

    beginVideo = () => {
        if(!this.current_runner) {
            this.err_report_missing_current_runner_in("beginVideo");
            return;
        }

        console.log("[AnimBackgrounds] beginVideo while current_runner");

        this._isPlaying = true;

        this.canvas.style.display = "block";

        const try_start = () => {
            try {
                this.current_runner.start(this.current_page, this.canvas);
                console.log("[AnimBackgrounds] current_runner.start succeeded!");
            }
            catch(err) {
                console.error(err);
            }
        };

        try_start();

        if (isChromium()) {

            const interactionEvents = [
                "mousedown",
                "scroll",
                "keydown",
            ];

            const onInteract = () => {
                try_start();

                for (const ev of interactionEvents) {
                    document.body.removeEventListener(ev, onInteract);
                }
            };

            for (const ev of interactionEvents) {
                document.body.addEventListener(ev, onInteract);
            }
        }

        this.onResizeCanvas(R20.getCanvasWidth(), R20.getCanvasHeight());
        this.onSetZoom(R20.getCanvasZoom());

        requestAnimationFrame(this.render_loop);

        R20.renderAll();
    };

    endVideo() {
        if(!this.current_runner) {
            this.err_report_missing_current_runner_in("endVideo");
            return;
        }

        console.log("[AnimBackgrounds] endVideo while current_runner");

        this._isPlaying = false;
        this.current_runner.end(this.canvas);

        R20.renderAll();
    }

    onPropChange = () => {
        if(!this.current_runner) {
            return;
        }

        console.log("[AnimBackgrounds] onPropChange while current_runner");

        this.endVideo();

        if(this.current_runner.can_play(this.current_page)) {
            this.beginVideo();
        }
    };

    cleanupPage() {
        console.log("[AnimBackgrounds] cleanupPage");

        this.endVideo();

        for (const ev of this._events) {
            ev.unsubscribe();
        }

        if(this.current_runner) {
            this.current_runner.dispose();
        }

        if(this.canvas) {
            this.canvas.remove();
            this.canvas = null;
        }
    }

    initPage = () => {
        this.cleanupPage();

        const page = R20.getCurrentPage();

        const pageGetter = () => page;
        this._events = [
            EventSubscriber.subscribe(`change:${AnimatedBackgroundLayer.propVideoSource}`, this.onPropChange, pageGetter),
            EventSubscriber.subscribe(`change:${AnimatedBackgroundLayer.propVideoEnabled}`, this.onPropChange, pageGetter),
            EventSubscriber.subscribe(`change:height`, this.onPropChange, pageGetter),
            EventSubscriber.subscribe(`change:width`, this.onPropChange, pageGetter),
        ];

        this.current_page = page;

        R20.renderAll();

        {
            this.canvas = <canvas/>;

            const root = AnimBgUtils.get_main_canvas();

            if(root) {
                root.parentNode.insertBefore(this.canvas, root);
                this.canvas.width = root.width;
                this.canvas.height = root.height;
                this.roll20Canvas = root;
            }

            // TODO figure out which runner we need for this page / null
            const cfg = this.getHook().config;
            this.current_runner = new VideoRunner();
            this.current_runner.init(cfg, this.canvas);

            if (this.current_runner && this.current_runner.can_play(this.current_page)) {
                this.beginVideo();
            }
        }
    };

    onResizeCanvas = (width: number, height: number) => {
        if(this._isPlaying) {
            console.log("[AnimBackgrounds] onResizeCanvas while _isPlaying");

            this.canvas.width = width;
            this.canvas.height = height;

            // fixes scale resets after resize
            this.onSetZoom(R20.getCanvasZoom());
        }
    };

    overrideSetCanvasSize = (width: number, height: number) => {
        this._originalResize(width, height);
        this.onResizeCanvas(width, height);
    };

    onSetZoom = (coef: number) => {
        if (this._isPlaying) {
            console.log("[AnimBackgrounds] onSetZoom while _isPlaying");
            this.current_runner.on_zoom(coef);
        }
    };

    ui_show_configuration_dialog = () => {
        this._dialog.show(this, this.current_page);
    };

    onSettingChange(name: string, oldVal: any, newVal: any) {
        if(this.current_runner) {
            console.log("[AnimBackgrounds] onSettingChange while current_runner");
            this.current_runner.on_setting_change(name, oldVal, newVal);
        }
    }

    trampoline_draw_background = (e: CanvasRenderingContext2D, t : any) =>{
        if(this._isPlaying) {
            const old_fill = e.fillStyle;
            const old_global_compo_op = e.globalCompositeOperation;

            // NOTE(Justas): equivalent to a glClear(GL_COLOR_BUFFER_BIT)
            e.fillStyle = "rgba(0,0,0,0)";
            e.globalCompositeOperation = "copy";

            {
                const zoom = R20.getCanvasZoom();
                e.fillRect(0, 0,
                    Math.ceil(R20.getCanvasWidth() / zoom),
                    Math.ceil(R20.getCanvasHeight() / zoom)
                );
            }

            e.fillStyle = old_fill;
            e.globalCompositeOperation = old_global_compo_op;
        }
        else {
            this.original_canvas_overlay_draw_background(e, t);
        }
    };

    original_canvas_overlay_draw_background: (e: CanvasRenderingContext2D, t: any) => void;

    setup() {
        console.log("video before ==================================");

        this._originalResize = window.d20.engine.setCanvasSize;
        window.d20.engine.setCanvasSize = this.overrideSetCanvasSize;

        window.r20es.onZoomChange = this.onSetZoom;
        window.r20es.onResizeCanvas = this.onResizeCanvas;

        this.original_canvas_overlay_draw_background = window.d20.canvas_overlay.drawBackground;
        window.d20.canvas_overlay.drawBackground = this.trampoline_draw_background;

        this.initPage();
        window.r20es.onPageChange.on(this.initPage);

        if (R20.isGM()) {
            const widgetStyle = {
                cursor: "pointer",
                position: "absolute",
                top: "0",
                right: "400px",
                maxWidth: "32px",
                maxHeight: "32px",
                zIndex: "10",
                backgroundColor: "#e18e42",
                padding: "0px 0px 1px",
                borderRadius: "3px;",
            };

            this._showSettingsWidget = (
                <div title="Animated Background Setup (VTTES)" style={widgetStyle}
                     onClick={this.ui_show_configuration_dialog}
                >
                    <img src="https://github.com/encharm/Font-Awesome-SVG-PNG/raw/master/black/png/32/film.png"
                         maxWidth="28" maxHeight="28" alt="ANIM"/>
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

        window.d20.canvas_overlay.drawBackground = this.original_canvas_overlay_draw_background;
        this.original_canvas_overlay_draw_background = null;

        this._showSettingsWidget.remove();
        this._showSettingsWidget = null;

        this._dialog.dispose();

        if(this.current_runner) {
            this.current_runner.dispose;
        }

        window.r20es.onPageChange.off(this.initPage);
    }
}

const check_if_url_is_video_stream = (
    url: string,
    ok_callback: () => void,
    err_callback: () => void
) => {
    const testElement = document.createElement("video") as HTMLVideoElement;

    // NOTE(justas): TS complains that crossorigin is invalid and that I should use crossOrigin
    // but turns out crossOrigin doesn't work on firefox.
    // Great.
    testElement["crossorigin"] = "anonymous";
    testElement.volume = 0;

    const removeEventListeners = () => {
        testElement.pause();
        testElement.removeEventListener("error", onError);
        testElement.removeEventListener("canplay", onCanPlay);
        testElement.src = "";
    };

    const onError = e => {
        removeEventListeners();
        console.log("check_if_url_is_video_stream error:", e);
        err_callback();
    };

    const onCanPlay = e => {
        removeEventListeners();
        ok_callback();
    };

    testElement.addEventListener("error", onError);
    testElement.addEventListener("canplay", onCanPlay);

    testElement.src =  url;
    console.log(url);
    testElement.play();
};

class AnimBackgroundSetup extends DialogBase<null> {
    constructor() {
        super();
    }

    parent_module: any;
    page: Roll20.Page;

    public show(parent_module: any, page: Roll20.Page) {
        this.parent_module = parent_module;
        this.page = page;

        this.internalShow();
        this.ui_verify_media_url(AnimBgUtils.get_video_source(page), false);
    };

    onChangeEnabled = (e) => {
        AnimBgUtils.set_anim_enabled(this.page, e.target.checked);
    };

    ui_is_invalid_media_url = false;

    onBlurUrl = (e) => {
        e.stopPropagation();
        this.ui_on_update_url_input(e.target.value);
    };

    ui_on_update_url_input = (url: string) => {
        AnimBgUtils.set_video_source(this.page, url);
        this.ui_verify_media_url(url, true);
    };

    module_get_history = () => this.parent_module.getHook().config.video_history;
    module_save_history = (val: string[]) => this.parent_module.setConfigValue("video_history", val);

    ui_verify_media_url = (url: string, true_if_push_history: boolean) => {

        check_if_url_is_video_stream(url, () => {
            if(true_if_push_history) {
                const hist = this.module_get_history() as string[];
                removeByReference(hist, url);
                hist.unshift(url);
                this.module_save_history(hist);
            }

            this.ui_is_invalid_media_url = false;
            this.rerender();
        }, () => {
            this.ui_is_invalid_media_url = true;
            this.rerender();
        });
    };

    ui_toggle_history = () => {
        this.show_history = !this.show_history;
        this.rerender();
    };

    show_history = false;
    ui_history_url_attrib = "url";

    ui_history_retrieve_url = (e) => {
        return e.target.getAttribute(this.ui_history_url_attrib);
    };

    ui_history_remove = (e) => {
        const url = this.ui_history_retrieve_url(e);
        const hist = this.module_get_history();
        removeByReference(hist, url);
        this.module_save_history(hist);
        this.rerender();
    };

    ui_history_select = (e) => {
        const url = this.ui_history_retrieve_url(e);
        this.ui_on_update_url_input(url);
    };

    public render() {
        const hist = this.module_get_history();
        const hist_widgets = [];
        const is_enabled = AnimBgUtils.is_anim_enabled(this.page);
        const video_source = AnimBgUtils.get_video_source(this.page);

        if(this.show_history) {
            const set_url = (widget, url) => widget.setAttribute(this.ui_history_url_attrib, url);

            for(const url of hist) {
                const style = {width: "auto", marginRight: "8px"};
                const rm_button = <input style={style} className="btn" type="button" value="X" onClick={this.ui_history_remove}/>;
                const url_button = <input style={style} className="btn" type="button" value="Use" onClick={this.ui_history_select}/>;
                const url_text = <span title={url}>{nearly_format_file_url(url)}</span>;

                set_url(rm_button, url);
                set_url(url_button, url);

                hist_widgets.push(
                    <div>
                        {rm_button}
                        {url_button}
                        {url_text}
                    </div>);
            }

            if(hist.length == 0) {
                hist_widgets.push(<div>Nothing here!</div>)
            }
        }

        const url_status_widget = <span/>;
        if(this.ui_is_invalid_media_url) {
            DOM.apply_style(url_status_widget, {float: "right", ...CommonStyle.error_span});
            url_status_widget.innerText = "Invalid: Not a direct video stream";
        }
        else {
            DOM.apply_style(url_status_widget, {float: "right", ...CommonStyle.success_span});
            url_status_widget.innerText = "URL is valid!";
        }

        return (
            <Dialog>
                <DialogHeader>
                    <h2>Animated Background Setup</h2>
                </DialogHeader>

                <DialogBody>

                    <div>
                        <i>Disclaimer: Players must have VTTES installed to be able to see the animated background.</i>
                    </div>

                    <br/>

                    <div style={{display: "grid", gridTemplateColumns: "auto auto", rowGap: "4px"}}>
                        <b>Enabled?</b>
                        <div>
                            <input type="checkbox" onChange={this.onChangeEnabled} checked={is_enabled}/>
                        </div>

                        <span>
                            <b>Media URL </b>
                            <i>(must be a direct stream)</i>
                        </span>

                        <div>
                            <input style={{paddingLeft: "8px"}} type="text" onBlur={this.onBlurUrl} value={video_source}/>
                        </div>
                    </div>

                    <div>
                        {url_status_widget}
                    </div>

                    <br/>

                    <button style="btn" onClick={this.ui_toggle_history}>{this.show_history ? "Hide History" : "Show History"}</button>

                    <br/>

                    <div style={{maxHeight: "500px", overflowY: "auto"}}>
                        {hist_widgets}
                    </div>

                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button style={{ boxSizing: "border-box", width: "100%" }} className="btn" onClick={this.close}>OK</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>
        )
    }
}

if (R20Module.canInstall()) new AnimatedBackgroundLayer().install();



