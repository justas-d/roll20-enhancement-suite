const pushLog = (context, time, type, data) => {
    context.logs.push({
        time: time,
        type: type,
        data: data
    });
};

export const makeLoggerContext = () => ({
    startTime: Date.now(),
    logs: []
});

export const wrapLogger = (context, logFx, type) => {
    return (...args) => {
        const t = Date.now() - context.startTime;
        pushLog(context, t, type, args);

        logFx.apply(null, args);
    }
};

export const wrapConsoleLogging = (context) => {
    console.log = wrapLogger(context, console.log, "log");
    console.warn = wrapLogger(context, console.warn, "warn");
    console.error = wrapLogger(context, console.error, "error");
    console.debug = wrapLogger(context, console.debug, "debug");
    console.info = wrapLogger(context, console.info, "info");
};

export const initializeDefaultLogWrapperOrReusePreviousInThisContext = () => {
    window.r20es = window.r20es || {};
    window.r20es.logging = window.r20es.logging || makeLoggerContext();
    wrapConsoleLogging(window.r20es.logging);
};
