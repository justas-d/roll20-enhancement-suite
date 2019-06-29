import {R20Module} from "../../utils/R20Module"
import {R20} from "../../utils/R20";
import {DOM} from "../../utils/DOM";
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
import {CommonStyle} from "../../utils/CommonStyles";

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

interface StoredShaderV1 {
    version: number;
    name: string;
    fragment_shader: string
}

interface ShaderCompileResult {
    id: Optional<WebGLShader>,
    success: boolean,
    error: Optional<string>
}

const try_compile_shader_part = (gl: WebGL2RenderingContext, type: number, source: string): ShaderCompileResult => {
    const part = gl.createShader(type);
    if(!part) {
        return {
            id: undefined,
            success: false,
            error: "gl.createShader failed"
        }
    }

    gl.shaderSource(part, source);
    gl.compileShader(part);

    const status = gl.getShaderParameter(part, gl.COMPILE_STATUS) as Boolean;

    if(!status) {
        const log = gl.getShaderInfoLog(part);
        console.log(log);
        gl.deleteShader(part);
        return {
            id: undefined,
            success: false,
            error: log
        };
    }

    return {
        id: part,
        success: true,
        error: undefined
    }
};

const ONE_QUAD_VERTEX_SHADER = `#version 300 es
in mediump vec2 VboVertices;
void main() {
    gl_Position = vec4(VboVertices, 0, 1);
}
`;

const construct_proper_fragment_shader = (frag: string): string => {
    return `#version 300 es
precision mediump float;

out mediump vec4 r20es_final_color;
uniform vec2 r20es_offset;
uniform vec2 r20es_scale;

uniform float iTime;
uniform float iTimeDelta;
uniform int iFrame;
uniform vec2 iResolution;
uniform vec4 iMouse;
uniform vec4 iDate;
#line 0
${frag}
void main() {
    
    vec2 our_frag_coord = gl_FragCoord.xy;
    
    // NOTE(Justas): @HACK
    // we convert the fragCoord to a aspect adjusted normalized coordinate 
    // position in [-1; 1] space and do the scale on that. 
    our_frag_coord -= r20es_offset;
    vec2 temp_uv = ((2. * our_frag_coord) / iResolution) - 1.;
    vec2 aspect = vec2(1, iResolution.y / iResolution.x); 
    temp_uv *= aspect;  
    temp_uv /= r20es_scale;
    our_frag_coord = (((temp_uv / aspect) + 1.0) * iResolution) * .5;
      
    vec4 col = vec4(0,0,0,1);
    mainImage(col, our_frag_coord);
    r20es_final_color = col;
}
`
};

const try_compile_fragment_shader = (proper_frag_shader: string): Optional<string> => {
    let canvas = <canvas/>;
    let gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
    let vert: Optional<ShaderCompileResult>;
    let frag : Optional<ShaderCompileResult>;
    let shader : Optional<WebGLProgram>;

    const dispose_all_the_gl_stuff = () => {
        if(frag && frag.id) gl.deleteShader(frag.id);
        if(vert && vert.id) gl.deleteShader(vert.id);
        if(shader) gl.deleteProgram(shader);
        vert = null;
        frag = null;
        shader = null;
        gl = null;
        canvas = null;
    };

    this.gl = gl;

    if(!this.gl) {
        return "Could not create webgl2 context.";
    }

    vert = try_compile_shader_part(gl, gl.VERTEX_SHADER, ONE_QUAD_VERTEX_SHADER);
    frag = try_compile_shader_part(gl, gl.FRAGMENT_SHADER, proper_frag_shader);

    if(!vert.success) {
        const err= vert.error;
        dispose_all_the_gl_stuff();
        return err;
    }

    if(!frag.success) {
        const err= frag.error
        dispose_all_the_gl_stuff();
        return err;
    }

    shader = gl.createProgram();
    if(!shader) {
        dispose_all_the_gl_stuff();
        return "glCreateProgram failed.";
    }

    gl.attachShader(shader, vert.id);
    gl.attachShader(shader, frag.id);

    gl.linkProgram(shader);
    gl.deleteShader(vert.id);
    gl.deleteShader(frag.id);

    if(!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
        const err=  gl.getProgramInfoLog(shader);
        dispose_all_the_gl_stuff();
        return err;
    }

    dispose_all_the_gl_stuff();
    return undefined;
};

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

    static is_shader_anim_enabled = (page: Roll20.Page): boolean => {
        const val = page.attributes[AnimatedBackgroundLayer.page_prop_shader_enabled];
        if (typeof val !== "boolean") return false;
        return val;
    };

    static set_shader_anim_enabled = (page: Roll20.Page, state: boolean): void => {
        page.save({
            [AnimatedBackgroundLayer.page_prop_shader_enabled]: state,
        });
    }

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


class ShaderRunner implements  BaseAnimRunner{
    gl: WebGL2RenderingContext;
    quad_vao: WebGLVertexArrayObject;
    quad_vbo = WebGLBuffer;
    is_valid = false;
    shader: WebGLProgram;
    time = 0;
    last_render_time = 0;
    scale = 1;
    frame_number = 0;

    uniform_time_loc: Optional<WebGLUniformLocation>;
    uniform_resolution_loc: Optional<WebGLUniformLocation>;
    uniform_mouse_loc: Optional<WebGLUniformLocation>;
    uniform_offset_loc: Optional<WebGLUniformLocation>;
    uniform_scale_loc: Optional<WebGLUniformLocation>;
    uniform_time_delta_loc: Optional<WebGLUniformLocation>;
    uniform_frame_number_loc: Optional<WebGLUniformLocation>;
    uniform_date_loc: Optional<WebGLUniformLocation>;

    canvas_mouse_pos: {x: number, y: number} = {x: 0, y: 0};
    is_lmb_down = false;
    is_rmb_down = false;

    render_frame = (page: Roll20.Page, canvas: HTMLCanvasElement, roll20Canvas: HTMLCanvasElement,  in_time: number): boolean => {
        if(this.is_valid) {
            const delta_time = (in_time - this.last_render_time) / 1000.0;
            this.time += delta_time;

            this.last_render_time = in_time;

            const gl = this.gl;

            const zoom = R20.getCanvasZoom();
            const zoomed_map_x = 70 * page.attributes.width * zoom;
            const zoomed_map_y = 70 * page.attributes.height * zoom;

            let canvas_x = 0;
            let canvas_y = 0;

            let is_x_really_zoomed_in = false;
            let is_y_really_zoomed_in = false;
            let x_off = -R20.getCanvasOffsetX() * zoom;
            let y_off = R20.getCanvasOffsetY() * zoom;

            if(zoomed_map_x < roll20Canvas.width) {
                canvas_x = zoomed_map_x;
            }
            else {
                canvas_x = roll20Canvas.width;
                is_x_really_zoomed_in = true;
            }

            if(zoomed_map_y < roll20Canvas.height) {
                canvas_y = zoomed_map_y;
            }
            else {
                canvas_y = roll20Canvas.height;
                is_y_really_zoomed_in = true;
            }

            canvas.width = canvas_x;
            canvas.height = canvas_y;

            const special_case = is_x_really_zoomed_in && is_y_really_zoomed_in;

            {
                const extra_y_off = (zoomed_map_y - roll20Canvas.height) * .5;
                if (extra_y_off > 0) {
                    y_off -= extra_y_off;
                }
            }

            {
                const extra_x_off = (zoomed_map_x - roll20Canvas.width) * .5;
                if(extra_x_off > 0) {
                    x_off += extra_x_off;
                }
            }

            gl.viewport(0,0, canvas_x, canvas_y);

            const mouse = this.canvas_mouse_pos;

            if(this.uniform_date_loc) {
                const d = new Date();
                const year = d.getUTCFullYear();
                const month = d.getUTCMonth();
                const day = d.getUTCDay();
                const seconds = d.getUTCSeconds();
                gl.uniform4f(this.uniform_date_loc, year, month, day, seconds);
            }
            if(this.uniform_frame_number_loc) {
                gl.uniform1i(this.uniform_frame_number_loc, this.frame_number);
            }
            if(this.uniform_offset_loc) {
                gl.uniform2f(this.uniform_offset_loc, x_off, y_off);
            }
            if(this.uniform_scale_loc) {
                const x_scale = special_case ? zoom : 1;
                const y_scale = special_case ? zoom : 1;

                gl.uniform2f(this.uniform_scale_loc, x_scale, y_scale);
            }
            if(this.uniform_time_loc) {
                gl.uniform1f(this.uniform_time_loc, this.time);
            }
            if(this.uniform_time_delta_loc) {
                gl.uniform1f(this.uniform_time_delta_loc, delta_time);
            }
            if(this.uniform_resolution_loc) {
                gl.uniform2f(this.uniform_resolution_loc, canvas.width, canvas.height);
            }
            if(this.uniform_mouse_loc) {
                gl.uniform4f(this.uniform_mouse_loc,
                    this.is_lmb_down ? mouse.x : 0,
                    this.is_lmb_down ? mouse.y : 0,
                    this.is_lmb_down as any as number,
                    this.is_rmb_down as any as number
                );
            }

            gl.clearColor(0,0,0,0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            ++this.frame_number;
            return true;
        }

        return false;
    };

    report_error_and_cleanup = (err: string) => {
        alert(err);
        this.dispose();
    };

    init = (cfg: any, canvas: HTMLCanvasElement): void => {
        const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
        this.gl = gl;
        if(!this.gl) {
            this.report_error_and_cleanup("gl unavailable!");
            return;
        }

        this.quad_vao = gl.createVertexArray();
        if(!this.quad_vao) {
            this.report_error_and_cleanup("vao fail");
            return;
        }

        gl.bindVertexArray(this.quad_vao);

        // @ts-ignore
        this.quad_vbo = gl.createBuffer();
        if(!this.quad_vbo) {
            this.report_error_and_cleanup("vbo fail");
            return;
        }
        const quad_verts = new Float32Array([
            -1.0, -1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0
        ]);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.quad_vbo);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false,0, 0);

        gl.bufferData(gl.ARRAY_BUFFER, quad_verts, gl.STATIC_DRAW);

        const try_compile_shader_part = (type: number, source: string): {id: Optional<WebGLShader>, success: boolean, error: Optional<string> } => {
            const part = gl.createShader(type);
            if(!part) {
                return {
                    id: undefined,
                    success: false,
                    error: "gl.createShader failed"
                }
            }

            gl.shaderSource(part, source);
            gl.compileShader(part);

            const status = gl.getShaderParameter(part, gl.COMPILE_STATUS) as Boolean;

            if(!status) {
                const log = gl.getShaderInfoLog(part);
                console.log(log);
                gl.deleteShader(part);
                return {
                    id: undefined,
                    success: false,
                    error: "log: " + log
                };
            }

            return {
                id: part,
                success: true,
                error: undefined
            }
        };

        const vert = try_compile_shader_part(gl.VERTEX_SHADER, `#version 300 es
in mediump vec2 VboVertices;
void main() {
    gl_Position = vec4(VboVertices, 0, 1);
}
`);
        const frag = try_compile_shader_part(gl.FRAGMENT_SHADER, `#version 300 es

precision mediump float;

out mediump vec4 r20es_final_color;
uniform vec2 r20es_offset;
uniform vec2 r20es_scale;

uniform float iTime;
uniform float iTimeDelta;
uniform int iFrame;
uniform vec2 iResolution;
uniform vec4 iMouse;
uniform vec4 iDate;

#define v2 vec2
#define v3 vec3
#define v4 vec4
#define f32 float
#define s32 int
#define b32 bool
#define m2 mat2
#define TAU 6.283185307179586
#define DEG_TO_RAD (TAU / 360.0)
#define zero_v2 vec2(0,0)

v2 uv;

f32 random (v2 p) {
    return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453123);
}

f32 noise (v2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

f32 fbm(v2 p, f32 freq, f32 amp, f32 lacunarity, f32 gain, s32 octave) {
    f32 accum = 0.;
    //f32 ang = 1.6180339;
    f32 ang = 0.5;

    for(s32 i = 0; i < octave; i++) {
        f32 n = noise(p) * amp;
        accum += n;

        amp *= gain;

        p = (m2(cos(ang), sin(ang), -sin(ang), cos(ang)) * p) * freq + v2(1000., 0.);
        p *= 2.;

        freq *= lacunarity;
    }

    return accum;
}

f32 fbm_s(v2 p) {
    return fbm(p, 1.5, .6, 1.1, .5, 5);
}

void mainImage(out vec4 out_color, in vec2 fragCoord) {
    f32 time = iTime * .1;
    uv = (2. * fragCoord / iResolution) - 1.;
    uv.y *= iResolution.y / iResolution.x;
   
    out_color.rgba = v4(0,0,0,1);
    
    v2 p = abs(uv);
    p *= 2.;
    p += v2(1000. - time * .02);
    p += iMouse.zw;

    v2 f1 = v2(fbm_s(p) + time * .02, fbm_s(p));
    v2 f2 = v2(fbm_s(p + f1 + atan(fbm_s(f1) + p.x * p.y)), fbm_s(p + f1 * 2.));
    v2 f3 = v2(fbm_s(p + f2 * 5.), fbm_s(p + f2 + atan(fbm_s(f2))));
    f32 final = fbm_s(p + f3 * 4. + time * 4.);

    f32 r = clamp(final - 0.3, 0., 1.);
    f32 g = clamp(final, 0., .2);

    out_color.rb = v2(1) * v2(r, g);
    out_color.rgb *= (1.1 - length(uv)) * (1.2 - length(uv));
}

void main() {
    
    vec2 our_frag_coord = gl_FragCoord.xy;
    
    // NOTE(Justas): @HACK
    // we convert the fragCoord to a aspect adjusted normalized coordinate 
    // position in [-1; 1] space and do the scale on that. 
    our_frag_coord -= r20es_offset;
    vec2 temp_uv = ((2. * our_frag_coord) / iResolution) - 1.;
    vec2 aspect = vec2(1, iResolution.y / iResolution.x); 
    temp_uv *= aspect;  
    temp_uv /= r20es_scale;
    our_frag_coord = (((temp_uv / aspect) + 1.0) * iResolution) * .5;
      
    vec4 col = vec4(0,0,0,1);
    mainImage(col, our_frag_coord);
    r20es_final_color = col;
}
`);

        if(!vert.success) {
            if(frag.id) gl.deleteShader(frag.id);
            if(vert.id) gl.deleteShader(vert.id);

            this.report_error_and_cleanup(`vert: ${vert.error}`);
            return;
        }

        if(!frag.success) {
            if(frag.id) gl.deleteShader(frag.id);
            if(vert.id) gl.deleteShader(vert.id);

            this.report_error_and_cleanup(`frag: ${frag.error}`);
            return;
        }

        const shader = gl.createProgram();
        if(!shader) {
            this.report_error_and_cleanup("shader");
            return;
        }

        gl.attachShader(shader, vert.id);
        gl.attachShader(shader, frag.id);

        gl.linkProgram(shader);
        gl.deleteShader(vert.id);
        gl.deleteShader(frag.id);

        if(!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
            gl.deleteProgram(shader);
            const log = gl.getProgramInfoLog(shader);
            this.report_error_and_cleanup(`link failed: ${log}`);
            return;
        }
        this.shader = shader;

        this.is_valid = true;

        this.uniform_time_loc = gl.getUniformLocation(shader, "iTime");
        this.uniform_resolution_loc = gl.getUniformLocation(shader, "iResolution");
        this.uniform_mouse_loc = gl.getUniformLocation(shader, "iMouse");
        this.uniform_time_delta_loc = gl.getUniformLocation(shader, "iTimeDelta");
        this.uniform_frame_number_loc = gl.getUniformLocation(shader, "iFrame");
        this.uniform_date_loc = gl.getUniformLocation(shader, "iDate");

        this.uniform_offset_loc = gl.getUniformLocation(shader, "r20es_offset");
        this.uniform_scale_loc = gl.getUniformLocation(shader, "r20es_scale");

        this.end(canvas);
    };

    ui_on_mouse_move = (e: any) => {
        const rect = e.target.getBoundingClientRect();
        const pos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        this.canvas_mouse_pos = pos;
    };

    ui_process_mouse_state = (button: number, state: boolean) => {
        if(button == 0) this.is_lmb_down = state;
        else if(button == 2) this.is_rmb_down = state;
    }

    ui_on_mouse_down = (e: any) => {
        this.ui_process_mouse_state(e.button, true);
    };

    ui_on_mouse_up = (e: any) => {
        this.ui_process_mouse_state(e.button, false);
    };

    start = (page: Roll20.Page, canvas: HTMLCanvasElement): void => {
        if(this.is_valid) {
            this.gl.bindVertexArray(this.quad_vao);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad_vbo);
            this.gl.useProgram(this.shader);

            canvas.parentElement.addEventListener("mousemove", this.ui_on_mouse_move);
            canvas.parentElement.addEventListener("mousedown", this.ui_on_mouse_down);
            canvas.parentElement.addEventListener("mouseup", this.ui_on_mouse_up);
        }
    };

    end = (canvas: HTMLCanvasElement): void => {
        canvas.parentElement.removeEventListener("mousemove", this.ui_on_mouse_move);
        canvas.parentElement.removeEventListener("mousedown", this.ui_on_mouse_down);
        canvas.parentElement.removeEventListener("mouseup", this.ui_on_mouse_up);
    };

    can_play = (page: Roll20.Page): boolean => {
        // TODO
        return this.is_valid;
    };

    on_setting_change = (name: string, oldVal: any, newVal: any): void => {
        // TODO
    };

    on_zoom = (coef: number): void => {
        this.scale = coef;
    };

    dispose = (): void => {
        if(this.is_valid) {
            const gl = this.gl;

            gl.deleteVertexArray(this.quad_vao);
            gl.deleteBuffer(this.quad_vbo);
            gl.deleteProgram(this.shader);
            this.gl = null;
        }
    };
}

class AnimatedBackgroundLayer extends R20Module.OnAppLoadBase {
    static readonly propVideoSource = "r20es_video_src";
    static readonly propVideoEnabled = "r20es_video_enabled";

    static readonly page_prop_shader_enabled = "r20es_shader_enabled";

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
        console.error(`[${where}]: current_runner is null, bailing.`);
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
            this.current_runner = new ShaderRunner();
            //this.current_runner = new VideoRunner();
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
                borderRadius: "2px"
            };

            this._showSettingsWidget = (
                <div title="Animated Background Setup (R20ES)" style={widgetStyle}
                     onClick={this.ui_show_configuration_dialog}
                >
                    <img src="https://github.com/encharm/Font-Awesome-SVG-PNG/raw/master/black/png/32/film.png"
                         width="28" height="28" alt="ANIM"/>
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
        console.error("check_if_url_is_video_stream error:", e);
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

    module_get_shaders = (): StoredShaderV1[] => this.parent_module.getHook().config.shader_storage as StoredShaderV1[];
    module_save_shaders = (val: StoredShaderV1[]) => this.parent_module.setConfigValue("shader_storage", val);

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

    e_panel_select = 0;
    e_panel_video = 1;
    e_panel_shader = 2;
    e_panel_shader_edit_or_create = 3;

    current_panel = this.e_panel_select;

    ui_on_click_select_video = (e) => {
        e.stopPropagation();

        this.current_panel = this.e_panel_video;
        this.rerender();
    };

    ui_on_click_select_shader = (e) => {
        e.stopPropagation();

        this.current_panel = this.e_panel_shader;
        this.rerender();
    };

    ui_on_click_back_to_select = (e) => {
        e.stopPropagation();

        this.current_panel = this.e_panel_select;
        this.rerender();
    };

    ui_enter_shader_new_state = (shader: Optional<StoredShaderV1>) => {
        this.current_panel = this.e_panel_shader_edit_or_create;
        this.ui_shader_currently_edited_shader = shader;
        this.rerender();
    };

    ui_on_click_shader_new = (e) => {
        e.stopPropagation();
        this.ui_enter_shader_new_state(undefined);
    };

    render_select() {
        const button_style = {
            width: "100px",
            height: "100px",
            display: "inline",
        };
        return (
            <Dialog>
            <DialogHeader>
                <h2>Animated Background Select</h2>
            </DialogHeader>

            <DialogBody>
                <div style={{display: "flex", justifyContent: "center", alignContent: "center"}}>
                    <div>
                        <button className="btn" style={button_style} onClick={this.ui_on_click_select_video}>Video</button>
                        <button className="btn" style={button_style} onClick={this.ui_on_click_select_shader}>Shader</button>
                    </div>
                </div>
            </DialogBody>

            <DialogFooter>
                <DialogFooterContent>
                    <button style={{ boxSizing: "border-box", width: "100%" }} className="btn btn-primary" onClick={this.close}>Close</button>
                </DialogFooterContent>
            </DialogFooter>
        </Dialog>
        )
    }

    ui_select_shader_shader_name_attrib = "data-shader-name";

    ui_get_shader_name_from_event = (e) => {
        const shader_name = e.target.getAttribute(this.ui_select_shader_shader_name_attrib);
        if(typeof(shader_name) != "string") {
            return null;
        }
        return shader_name;
    };

    ui_get_shader_from_event = (e) => {
        const shader_name = this.ui_get_shader_name_from_event(e);

        const shaders = this.module_get_shaders();

        for(const shader of shaders) {
            if(shader.name === shader_name) {
                return shader;
            }
        }
        return null;
    };

    ui_select_shader_on_click_edit = (e) => {
        e.stopPropagation();
        const shader = this.ui_get_shader_from_event(e);
        if(!shader) {
            return;
        }

        this.ui_enter_shader_new_state(shader);
    };

    ui_select_shader_on_click_delete = (e) => {
        e.stopPropagation();
        const shader_name = this.ui_get_shader_name_from_event(e);

        if(confirm(`Are you sure you want to delete shader '${shader_name}'?`)) {
            const shaders = this.module_get_shaders();

            let index = 0;
            let did_find = false;
            for(const shader of shaders) {
                if(shader.name === shader_name) {
                    did_find = true;
                    break;
                }
                index++;
            }

            if(did_find) {
                shaders.splice(index, 1);
                this.module_save_shaders(shaders);

                this.rerender();
            }
        }
    };

    ui_select_shader_on_click_enabled = (e) => {
        e.stopPropagation();
        AnimBgUtils.set_shader_anim_enabled(this.page, e.target.value);
    };

    render_shader() {
        const shaders = this.module_get_shaders();
        const shader_widgets = [];

        for(const shader of shaders) {
            const name_attrib = {[this.ui_select_shader_shader_name_attrib]: shader.name};

            shader_widgets.push(<div style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>
                <div style={{display: "flex", alignContent: "center"}}>
                    {shader.name}
                </div>

                <div>
                    <button {...name_attrib} onClick={() => alert("todo")} className="btn btn-success">Use</button>
                    <button {...name_attrib} onClick={this.ui_select_shader_on_click_edit} className="btn">Edit</button>
                    <button {...name_attrib} onClick={this.ui_select_shader_on_click_delete} className="btn btn-danger">Delete</button>
                </div>
            </div>)
        }

        if(shader_widgets.length <= 0) {
            shader_widgets.push(<div>
                "There's nothing here!"
            </div>)

        }

        return (
            <Dialog>
                <DialogHeader>
                    <h2>Shaders | Animated Background</h2>
                </DialogHeader>

                <DialogBody>
                    <div>
                        <b>Enabled?</b>
                        <input type="checkbox" onChange={this.ui_select_shader_on_click_enabled} checked={AnimBgUtils.is_shader_anim_enabled(this.page)}/>
                    </div>

                    <div>
                        Current Shader: TODO
                    </div>

                    <button onClick={this.ui_on_click_shader_new}>New</button>
                    {shader_widgets}
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button onClick={this.ui_on_click_back_to_select}>Back</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>
        )
    }

    // NOTE(Justas): widgets
    ui_shader_name_widget: HTMLInputElement;
    ui_shader_name_exists_widget: HTMLSpanElement;

    ui_shader_frag_widget: HTMLTextAreaElement;
    ui_shader_err_widget: HTMLTextAreaElement;
    ui_shader_save_error_widget: HTMLButtonElement;
    ui_shader_compile_error_widget: HTMLSpanElement;

    // NOTE(Justas): state
    // NOTE(Justas): ui_shader_currently_edited_shader, if not undefined, MUST be a ref to a table in a StoredShader
    // that belongs to a module_get_shaders
    // :CurrentlyEditedShaderLifetime
    ui_shader_currently_edited_shader: Optional<StoredShaderV1>;

    shader_verify_shader = ():boolean => {
        const frag = construct_proper_fragment_shader(this.ui_shader_frag_widget.value);
        const error = try_compile_fragment_shader(frag);

        if(error) {
            this.ui_shader_err_widget.value = error;
            this.ui_shader_compile_error_widget.style.visibility = "visible";
            return false;
        }

        this.ui_shader_err_widget.value = "Success!";
        this.ui_shader_compile_error_widget.style.visibility = "hidden";
        return true;
    };

    shader_verify_name = ():boolean => {
        const shaders = this.module_get_shaders();
        for(const shader of shaders) {
            if(shader.name === this.ui_shader_name_widget.value && shader != this.ui_shader_currently_edited_shader) {
                this.ui_shader_name_exists_widget.style.visibility = "visible";
                return false;
            }
        }

        this.ui_shader_name_exists_widget.style.visibility = "hidden";
        return true;
    };

    ui_shader_on_click_shader_compile = (e) => {
        e.stopPropagation();
        this.shader_verify_shader();
    };

    ui_shader_on_click_save = (e) => {
        e.stopPropagation();
        const handle_failure = () => {
            this.ui_shader_save_error_widget.style.visibility = "visible";
        };

        if(!this.shader_verify_shader()) {
            handle_failure();
            return;
        }
        if(!this.shader_verify_name()) {
            handle_failure();
            return;
        }

        this.ui_shader_save_error_widget.style.visibility = "hidden";

        {
            if (this.ui_shader_currently_edited_shader) {
                const shader = this.ui_shader_currently_edited_shader;
                shader.version = 1;
                shader.name = this.ui_shader_name_widget.value;
                shader.fragment_shader = this.ui_shader_frag_widget.value;
                // NOTE(Justas): :CurrentlyEditedShaderLifetime
                // we got ui_shader_currently_edited_shader from module_get_shaders
                // which is just a ref to the array in the config.
                // That means we can call .saveConfig() without recreating any arrays or anything
                // as we have already directly edited the correct shader table.
                this.parent_module.getHook().saveConfig();
            }
            else {
                const shaders = this.module_get_shaders();

                const new_shader: StoredShaderV1 = {
                    version: 1,
                    name: this.ui_shader_name_widget.value,
                    fragment_shader: this.ui_shader_frag_widget.value
                };

                shaders.push(new_shader);
                this.module_save_shaders(shaders);
            }
        }

        this.current_panel = this.e_panel_shader;
        this.rerender();
    };

    render_shader_edit_or_create() {
        const name_widget = <input type="text"/>;
        const name_exists_widget = <span style={CommonStyle.error_span}>A shader with this name already exists!</span>;
        name_exists_widget.style.visibility = "hidden";

        const text_area_style = {
            display: "block",
            width: "900px",
            fontFamily: "monospace"
        };

        const frag_widget = <textarea style={{...text_area_style, height: "300px"}} onMouseUp={() => this.recenter()} autoComplete="off" autoFocus="false" spellcheck="false" autoCapitalize="none"/>;
        const err_widget = <textarea style={{...text_area_style, height: "50px"}} disabled={true} autoComplete="off" autoFocus="false" spellcheck="false" autoCapitalize="none"/>;
        // NOTE(Justas): because setting these on the tags above doesn't work???
        frag_widget.spellcheck = false;
        err_widget.spellcheck = false;
        const save_error_widget = <span style={CommonStyle.error_span}>Cannot save as some data is invalid!</span>;
        const compile_error_widget = <span style={CommonStyle.error_span}>Compilation Failed!</span>;
        compile_error_widget.style.visibility = "hidden";
        save_error_widget.style.visibility = "hidden";

        this.ui_shader_save_error_widget = save_error_widget;
        this.ui_shader_name_widget = name_widget;
        this.ui_shader_name_exists_widget = name_exists_widget;
        this.ui_shader_frag_widget = frag_widget;
        this.ui_shader_err_widget = err_widget;
        this.ui_shader_compile_error_widget = compile_error_widget;

        if(this.ui_shader_currently_edited_shader) {
            name_widget.value = this.ui_shader_currently_edited_shader.name;
            frag_widget.value = this.ui_shader_currently_edited_shader.fragment_shader;
        }
        else {
            name_widget.value = "New Shader";
            frag_widget.value = `void mainImage(out vec4 out_color, in vec2 fragCoord) {
    vec2 uv = ((2. * fragCoord / iResolution) - 1.) / vec2(iResolution.x);
    out_color.rgba = vec4(uv.xy, 0., 1.);
}
`
        }

        return (
            <Dialog>
                <DialogHeader>
                    <h2>Shader | Animated Background</h2>
                </DialogHeader>

                <DialogBody>
                    <div>
                        {name_widget}
                        <span style={{marginRight: "8px", marginLeft: "8px"}}>Name</span>
                        {name_exists_widget}
                    </div>


                    <h3>Fragment Shader</h3>
                    {frag_widget}
                    {err_widget}
                    <div>
                        <button onClick={this.ui_shader_on_click_shader_compile}>Compile</button>
                        {compile_error_widget}
                    </div>
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button onClick={this.ui_on_click_select_shader}>Cancel</button>
                        <button onClick={this.ui_shader_on_click_save}>Save</button>
                        {save_error_widget}
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>
        )
    }

    render_video() {
        const hist = this.module_get_history();
        const hist_widgets = [];
        const is_enabled = AnimBgUtils.is_anim_enabled(this.page);
        const video_source = AnimBgUtils.get_video_source(this.page);

        if(this.show_history) {
            const set_url = (widget, url) => widget.setAttribute(this.ui_history_url_attrib, url);

            for(const url of hist) {
                const style = {width: "auto", marginRight: "8px"};
                const rm_button = <input style={style} className="btn btn-danger" type="button" value="X" onClick={this.ui_history_remove}/>;
                const url_button = <input style={style} className="btn btn-success" type="button" value="Use" onClick={this.ui_history_select}/>;
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
                    <h2>Video | Animated Background</h2>
                </DialogHeader>

                <DialogBody>

                    <div>
                        <i>Disclaimer: VTTES must be installed to be able to see the animated background.</i>
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
                        <button onClick={this.close}>OK</button>
                        <button onClick={this.ui_on_click_back_to_select}>Back</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>
        )
    }

    public render() {
        switch(this.current_panel) {
            case this.e_panel_select: {
                return this.render_select();
            }
            case this.e_panel_video: {
                return this.render_video();
            }
            case this.e_panel_shader: {
                return this.render_shader();
            }
            case this.e_panel_shader_edit_or_create: {
                return this.render_shader_edit_or_create();
            }
        }
    }

}

if (R20Module.canInstall()) new AnimatedBackgroundLayer().install();



