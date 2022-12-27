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

const is_anim_enabled = (page: Roll20.Page): boolean => {
  const val = page.attributes[AnimatedBackgroundLayer.propVideoEnabled];
  if (typeof val !== "boolean") return false;
  return val;
};

const set_anim_enabled = (page: Roll20.Page, state: boolean): void => {
  page.save({
    [AnimatedBackgroundLayer.propVideoEnabled]: state,
  });
};

const get_video_source = (page: Roll20.Page): string => {
  const val = page.attributes[AnimatedBackgroundLayer.propVideoSource];
  if (typeof val !== "string") return "";
  return val;
};

const set_video_source = (page: Roll20.Page, source: string) => {
  return page.save({
    [AnimatedBackgroundLayer.propVideoSource]: source,
  });
};

class AnimatedBackgroundLayer extends R20Module.OnAppLoadBase {
  static readonly propVideoSource = "r20es_video_src";
  static readonly propVideoEnabled = "r20es_video_enabled";

  is_playing_video: boolean = false;

  canvas: HTMLCanvasElement;

  roll20_composite_canvas: HTMLCanvasElement;
  manual_composite_canvas: HTMLCanvasElement;
  manual_composite_canvas_ctx : CanvasRenderingContext2D;

  original_resize_function: (width: number, height: number) => void;
  show_settings_element: HTMLElement;
  setup_dialog: AnimBackgroundSetup;

  current_page: Roll20.Page;

  events: EventSubscriber[] = [];

  ctx: CanvasRenderingContext2D;
  video: HTMLVideoElement;

  constructor() {
    super(__dirname);
  }

  render_loop = (time: number) => {
    if(this.is_playing_video) {
      const bbX = this.current_page.attributes.width * 70;
      const bbY = this.current_page.attributes.height * 70;

      const fitted = scaleToFit(this.video.videoWidth, this.video.videoHeight, bbX, bbY);

      this.ctx.drawImage(this.video,
        -R20.getCanvasOffsetX(),
        -R20.getCanvasOffsetY(),
        fitted.x, fitted.y
      );

      // fill in the blanks
      const fillMaxX = Math.ceil(R20.getCanvasWidth() / R20.getCanvasZoom());
      const fillMaxY = R20.getCanvasHeight() / R20.getCanvasZoom();

      this.ctx.fillStyle = this.current_page.attributes.background_color;
      this.ctx.fillRect(0, fitted.y - R20.getCanvasOffsetY(), fillMaxX, fillMaxY);
      this.ctx.fillRect(fitted.x - R20.getCanvasOffsetX(), 0, fillMaxX, fillMaxY);

      requestAnimationFrame(this.render_loop);
    }
  };

  manual_composite = () => {
    // TODO
    try {
      // @ts-ignore
      var final_canvas = window.d20.engine.final_canvas;

      // NOTE(Justas): equivalent to a glClear(GL_COLOR_BUFFER_BIT)
      this.manual_composite_canvas_ctx.fillStyle = "rgba(0,0,0,0)";
      this.manual_composite_canvas_ctx.globalCompositeOperation = "copy";

      {
        const zoom = R20.getCanvasZoom();

        this.manual_composite_canvas_ctx.fillRect(0, 0,
          Math.ceil(R20.getCanvasWidth() / zoom),
          Math.ceil(R20.getCanvasHeight() / zoom)
        );
      }

      this.manual_composite_canvas_ctx.drawImage(
        final_canvas, 
        0, 0, 
        this.manual_composite_canvas.width,
        this.manual_composite_canvas.height
      );

      console.log("composite");
    } catch(e) {
      console.error("composite ex");
      console.error(e);
    }
  }

  beginVideo = () => {
    console.log("[AnimBackgrounds] beginVideo while current_runner");

    this.is_playing_video = true;

    this.canvas.style.display = "block";

    const try_start = () => {
      try {
        const src = get_video_source(this.current_page);
        this.video.setAttribute("vttes-src", src);
        this.video.src = src;
        this.video.play();

        console.log(this.video);
        console.log("[AnimBackgrounds] current_runner.start succeeded!");

        this.roll20_composite_canvas.style.display = "none";
        this.roll20_composite_canvas.id = "babylonCanvas2";

        this.manual_composite_canvas.style.display = "block";
        this.manual_composite_canvas.id = "babylonCanvas";
      }
      catch(err) {
        console.error(err);
      }
    };

    try_start();

    if(isChromium()) {
      const interactionEvents = [
        "mousedown",
        "scroll",
        "keydown",
      ];

      const onInteract = () => {
        try_start();

        for(const ev of interactionEvents) {
          document.body.removeEventListener(ev, onInteract);
        }
      };

      for(const ev of interactionEvents) {
        document.body.addEventListener(ev, onInteract);
      }
    }

    this.onResizeCanvas(R20.getCanvasWidth(), R20.getCanvasHeight());
    this.onSetZoom(R20.getCanvasZoom());

    requestAnimationFrame(this.render_loop);

    R20.renderAll();

    // @ts-ignore
    window.r20es.manual_composite = this.manual_composite; // TODO
  };

  endVideo() {
    console.log("[AnimBackgrounds] endVideo while current_runner");

    // @ts-ignore
    window.r20es.manual_composite = undefined; // TODO

    const was_playing = this.is_playing_video;
    this.is_playing_video = false;

    this.canvas.style.display = "none";

    this.roll20_composite_canvas.style.display = "block";
    this.roll20_composite_canvas.id = "babylonCanvas";

    this.manual_composite_canvas.style.display = "none";
    this.manual_composite_canvas.id = "babylonCanvas2";

    this.video.pause();
    this.video.src = "";

    if(was_playing) {
      R20.renderAll();
    }
  }

  can_play = () => {
    return get_video_source(this.current_page).length > 0
        && is_anim_enabled(this.current_page);
  };

  onPropChange = () => {
    console.log("[AnimBackgrounds] onPropChange while current_runner");

    this.endVideo();

    if(this.can_play()) {
      this.beginVideo();
    }
  };

  initPage = () => {
    this.endVideo();

    const page = R20.getCurrentPage();

    const pageGetter = () => page;

    this.events = [
      EventSubscriber.subscribe(`change:${AnimatedBackgroundLayer.propVideoSource}`, this.onPropChange, pageGetter),
      EventSubscriber.subscribe(`change:${AnimatedBackgroundLayer.propVideoEnabled}`, this.onPropChange, pageGetter),
      EventSubscriber.subscribe(`change:height`, this.onPropChange, pageGetter),
      EventSubscriber.subscribe(`change:width`, this.onPropChange, pageGetter),
    ];

    this.current_page = page;

    R20.renderAll();

    if(this.can_play()) {
      this.beginVideo();
    }
  };

  onResizeCanvas = (width: number, height: number) => {
    if(this.is_playing_video) {
      console.log("[AnimBackgrounds] onResizeCanvas while is_playing_video");

      this.canvas.width = width;
      this.canvas.height = height;

      this.manual_composite_canvas.width = width;
      this.manual_composite_canvas.height = height;

      // fixes scale resets after resize
      this.onSetZoom(R20.getCanvasZoom());
    }
  };

  overrideSetCanvasSize = (width: number, height: number) => {
    this.original_resize_function(width, height);
    this.onResizeCanvas(width, height);
  };

  onSetZoom = (coef: number) => {
    if(this.is_playing_video) {
      console.log("[AnimBackgrounds] onSetZoom while is_playing_video");

      this.ctx.restore();
      this.ctx.save();
      this.ctx.scale(coef, coef);
    }
  };

  ui_show_configurationsetup_dialog = () => {
    this.setup_dialog.show(this, this.current_page);
  };

  set_volume(newVolume: number) {
    if(!this.video) {
      return;
    }

    try {
      this.video.volume = newVolume;
    } catch (e) {
      this.video.volume = 0.1;
    }
  }

  onSettingChange(name: string, oldVal: any, newVal: any) {
    if(name === "muteAudio" && this.video) {
      this.video.muted = newVal;
    }

    if(name === "audioVolume" && this.video) {
      this.set_volume(newVal);
    }
  }

  trampoline_draw_background = (e: CanvasRenderingContext2D, t : any) =>{
    if(this.is_playing_video) {
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

    {
      this.canvas = <canvas/>;
      // NOTE(justasd): Without this, the 'id="token-properties-layer"' div which is responsible for
      // showing nameplates and healthbars, won't render properly with the animated backgrounds
      // enabled.
      // 2022-08-31.
      this.canvas.style.position = "absolute";

      this.ctx = this.canvas.getContext("2d");
      this.ctx.save();
    }

    this.video = <video/>;

    {
      this.roll20_composite_canvas = document.querySelector("#babylonCanvas") as HTMLCanvasElement;
      if(!this.roll20_composite_canvas) {
        console.error(`[AnimatedBackgrounds] could not find rendering canvas!`);
      }
    }

    {
      this.manual_composite_canvas = <canvas>
        id="babylonCanvas2" 
        data-engine="Babylon.js v5.35.1" 
        touch-action="none" 
        style="touch-action: none; display: none; cursor: inherit;"
      </canvas>;

      this.manual_composite_canvas.style.display = "none";
      this.manual_composite_canvas_ctx = this.manual_composite_canvas.getContext("2d");
    }

    this.original_resize_function = window.d20.engine.setCanvasSize;
    window.d20.engine.setCanvasSize = this.overrideSetCanvasSize;

    window.r20es.onZoomChange = this.onSetZoom;
    window.r20es.onResizeCanvas = this.onResizeCanvas;

    this.original_canvas_overlay_draw_background = window.d20.canvas_overlay.drawBackground;
    window.d20.canvas_overlay.drawBackground = this.trampoline_draw_background;

    this.initPage();
    window.r20es.onPageChange.on(this.initPage);

    if(R20.isGM()) {
      const widgetStyle = {
        cursor: "pointer",
        position: "absolute",
        top: "0",
        right: "436px",
        maxWidth: "32px",
        maxHeight: "32px",
        zIndex: "10000",
        backgroundColor: "#e18e42",
        padding: "0px 0px 1px",
        borderRadius: "3px;",
      };

      this.show_settings_element = (
        <div title="Animated Background Setup (VTTES)" style={widgetStyle}
             onClick={this.ui_show_configurationsetup_dialog}
        >
          <img src="https://github.com/encharm/Font-Awesome-SVG-PNG/raw/master/black/png/32/film.png"
            maxWidth="28" maxHeight="28" alt="ANIM"
          />
        </div>
      );

      document.body.appendChild(this.show_settings_element);
      console.log(this.show_settings_element);
    }

    this.setup_dialog = new AnimBackgroundSetup();

    {
      const cfg = this.getHook().config;
      this.video.loop = true;
      this.video.autoplay = true;
      this.video.muted = cfg.muteAudio;
      this.set_volume(cfg.audioVolume);
    }

    {
      const root = this.roll20_composite_canvas;
      if(root) {
        root.parentNode.insertBefore(this.canvas, root);
        this.canvas.width = root.width;
        this.canvas.height = root.height;

        root.parentNode.insertBefore(this.manual_composite_canvas, root);
        this.manual_composite_canvas.width = root.width;
        this.manual_composite_canvas.height = root.height;
      }

      //this.video.addEventListener("ended", event => {
      //  var src = this.video.getAttribute("vttes-src");
      //  this.video.src = src;
      //  this.video.play();
      //  console.log("MANUAL LOOP!");
      //});
    }
  }

  dispose() {
    super.dispose();

    console.log("[AnimBackgrounds] cleanupPage");

    this.endVideo();

    for(const ev of this.events) {
      ev.unsubscribe();
    }

    this.video = null;
    this.ctx = null;

    this.canvas.remove();
    this.canvas = null;

    this.roll20_composite_canvas = null;

    this.manual_composite_canvas.remove();
    this.manual_composite_canvas_ctx = null;

    window.d20.engine.setCanvasSize = this.original_resize_function;

    window.r20es.onZoomChange = null;
    window.r20es.onResizeCanvas = null;

    window.d20.canvas_overlay.drawBackground = this.original_canvas_overlay_draw_background;
    this.original_canvas_overlay_draw_background = null;

    this.show_settings_element.remove();
    this.show_settings_element = null;

    this.setup_dialog.dispose();

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
    this.ui_verify_media_url(get_video_source(page), false);
  };

  onChangeEnabled = (e) => {
    set_anim_enabled(this.page, e.target.checked);
  };

  ui_is_invalid_media_url = false;

  onBlurUrl = (e) => {
    e.stopPropagation();
    this.ui_on_update_url_input(e.target.value);
  };

  ui_on_update_url_input = (url: string) => {
    set_video_source(this.page, url);
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
    const is_enabled = is_anim_enabled(this.page);
    const video_source = get_video_source(this.page);

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
          </div>
        );
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

          <div>
            <a href={"javascript:void(0) // workaround for underpopup dialog from roll20 regarding leaving the site"}
              onClick={() => {
                window.open("https://gist.github.com/justas-d/b4bc420993844d989c10e05226787e70", "_blank");
              }}
            >Places to host the backgrounds</a>
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

export default () => {
  new AnimatedBackgroundLayer().install();
};


// :AnimatedBackgroundAABug
// NOTE(justasd):
// Since 2022-11-30 a bug has appeared in the DOM canvas compositing where the
// opacity/blending of the Roll20 final canvas isn't properly utilized, maybe clipped, or
// lost, such that when the browser composites the video canvas with the final canvas images,
// the edges of the final canvas aren't anti-aliased any more.
//
// This creates high-frequency aliasing in sub-pixel grids and makes them look completely
// broken.
//
// We may need to move away from having a separate video canvas that the browser composites
// for us into manual compositing with a bunch of hooks into the Roll20 rendering loop. The
// problem with that is that it creates a spaghetti mess of 'insecure' uses of the canvas due
// to what I think has something to do with CORS.
//
// For now, we're hacking around it by drawing our own grid early and increasing the side of
// the square grid.
//
// 2022-12-01
//
// Notes:
/*
  
   Done on the 2022-12-15 vtt.bundle.js file

  renderLoop calls compositeCanvases and then this ft function? lt is a babylon
  HtmlElementTexture the engine of the babylon library seems to be webgl2 on top of the
  babylonCanvas element Maybe the webgl2 context of that engine is somehow not friendly to
  alpha?

    function ft() {
      lt == null || lt.update(!0)
    }

  The call to this ft function
    which is just (0,_engine_babylonSetup__WEBPACK_IMPORTED_MODULE_53__.i$)()
  seems to somehow be responsible for presenting the composited canvases to the screen. If we
  comment this out, we see nothing drawn except the token headers and such which are not part
  of the canvas drawing pipeline.

  We can look at update by searching for

    update(o = null) {

  The update method ends up calling
    b.updateDynamicTexture

  Which, when commented out, makes it so that nothing is drawn to the screen.

  The 
    this.onLoadObservable.notifyObservers(this)

  part in update seems to not be responsible for drawing.

  
  {
    find: `b.updateDynamicTexture(this._texture,D,o===null?!0:o,!1,this._format)`,
    replace: `b.updateDynamicTexture(this._texture, D, o === null ? !0 : o, true, this._format)`,
  },
  The find and replace makes the updateDynamicTexture premultiply the alpha of the texture and that seems to effect the result.
  So something in there is the culprit I think. Maybe something to do with the format?

  2022-12-15


  n.texImage2D(i, 0, b, C, p, g)

  =>

  texImage2D(
    TEXTURE_2D, // bound to this._texture
    0, 
    this._getRGBABufferInternalSizedFormat(t.type, C), // GL_RGBA8
    this._getInternalFormat(r || t.format), // GL_RGBA
    this._getWebGLTextureType(t.type), // GL_UNSIGNED_BYTE
    g // this.element
  );


  // WebGL1 api call??
  texImage2D(target, level, internalformat, format, type, pixels) // pixels cannot be a TypedArray or a DataView or null

  using a webgl2 call doesn't change anything
    texImage2D(target, level, internalformat, width, height, border, format, type, source)
    {
      find: `n.texImage2D(t,0,y,C,p,g)`,
      replace: `console.log("webgl2");n.texImage2D(t, 0, y, g.width, g.height, 0, C, p, g)`,
    }

  What is the target texture?
    seems to be a "canvasTexture"

    function Ft(Ve) {
      tt = new l.HtmlElementTexture("canvasTexture", Ve, {
          engine: qe
      }), tt.hasAlpha = !0, tt.wrapU = 0, tt.wrapV = 0, Ke()
    }

    Docs for HtmlElementTexture:

      new HtmlElementTexture(
        name: string, element: HTMLCanvasElement | HTMLVideoElement, options: IHtmlElementTextureOptions
      ): HtmlElementTexture

        Instantiates a HtmlElementTexture from the following parameters.

        Parameters
        name: string
        Defines the name of the texture

        element: HTMLCanvasElement | HTMLVideoElement
        Defines the video or canvas the texture is filled with

        options: IHtmlElementTextureOptions
        Defines the other none mandatory texture creation options

        Returns HtmlElementTexture

    What happens if we don't pass Ve to HtmlElementTexture
      Black screen

    TODO : what if we hijack Ve to be our own canvas? What are the results?

  
  What is the Ve argument?
    Ft(Ve) is called by
      engine_babylonSetup__WEBPACK_IMPORTED_MODULE_53__.em)(d20.engine.final_canvas),

    So Ve is d20.engine.final_canvas


  TODO : where do we use this target texture later?

  Waybe we can set the engine to be webgl2?
    Using webgl2 doesn't help!

    {
      find: `"webgl"`,
      replace: `"webgl2"`,
    },

    {
      find: `"experimental-webgl"`,
      replace: `"webgl2"`,
    },

  The _inputElement of the Babylon engine used in the HtmlElementTexture is
  div.canvas-container which is the div that contains the babylon canvas? 
  Is that meaningful?

  Okay _renderingCanvas is canvas#babylonCanvas which is the canvas that's actually displayed
  to the user.

  TODO : how do we blit to this canvas? Search for _renderingCanvas uses
    Can't find any kind of blit code that direclty uses _renderingCanvas
    getInputElement returns _renderingCanvas but it only seems to be used for input code

    getRenderingCanvas POI:
      }, pt.D.prototype._renderViews = function() {

      Looks like babylon has it's own render loop via _renderLoop or something!

  Modify the clear of babylon to not clear alpha?
    _clear() {
        (this.autoClearDepthAndStencil || this.autoClear) && this._engine.clear(this.clearColor, this.autoClear || this.forceWireframe || this.forcePointsCloud, this.autoClearDepthAndStencil, this.autoClearDepthAndStencil)
    }

    where this.ClearColor is a: 1 b: 0.3 g: 0.2 r: 0.2

    clear(O, L, Y, q=!1) {
        const X = this.stencilStateComposer.useStencilGlobalOnly;
        this.stencilStateComposer.useStencilGlobalOnly = !0,
        this.applyStates(),
        this.stencilStateComposer.useStencilGlobalOnly = X;
        let Z = 0;
        L && O && (this._gl.clearColor(O.r, O.g, O.b, O.a !== void 0 ? O.a : 1),
        Z |= this._gl.COLOR_BUFFER_BIT),
        Y && (this.useReverseDepthBuffer ? (this._depthCullingState.depthFunc = this._gl.GEQUAL,
        this._gl.clearDepth(0)) : this._gl.clearDepth(1),
        Z |= this._gl.DEPTH_BUFFER_BIT),
        q && (this._gl.clearStencil(0),
        Z |= this._gl.STENCIL_BUFFER_BIT),
        this._gl.clear(Z)
    }

    No difference with
      {
        find: `gl.clearColor(`,
        replace: `gl.clearColor(0,0,0,0),console.log(`,
      },


  TODO : _renderForCamera(ne, de, pe=!0) { may be interesting

  TODO : Could also be that the blend mode with which babylon is drawing is somehow incompatible with alpha

  The material used for rendering the fullsceen quad:
    g.x.DefaultMaterialFactory = Nr=>new xn("default material",Nr)


  this._renderingManager.render(null, null, !0, !0),

  Jesus this bablyon thing is a fucking mess. Can't Roll20 just bit blit the composited canvases??????????????????

*/

