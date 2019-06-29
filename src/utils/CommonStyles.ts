export class CommonStyle {
    static status_span_base = {
        "visibility": "visible",
        "background": "#e44949",
        "color": "white",
        "padding":"4px",
        "border-radius: ": "5px",
        "font-weight": "bold",
        "border-radius": "4px"
    };
    static error_span = {
        ...CommonStyle.status_span_base,
        "background": "#e44949",
    };

    static success_span = {
        ...CommonStyle.status_span_base,
        "background": "rgb(91, 177, 10)",
    };
}