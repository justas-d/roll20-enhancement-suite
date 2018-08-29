export default dirname => {
    // TODO : does node normalize paths across kernels? 
    const folders = dirname.split('/');
    if (folders.length <= 0) throw new Error("Invalid dirname given.");
    const topmost = folders[folders.length - 1];
    return topmost + ".js";
}
