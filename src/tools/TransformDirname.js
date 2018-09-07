export default dirname => {
    const folders = dirname.replace(/\\/g, '/').split('/');
    if (folders.length <= 0) throw new Error("Invalid dirname given.");
    const topmost = folders[folders.length - 1];
    return topmost + ".js";
}
