function safeParseJson(str) {

    try {
        return JSON.parse(str);
    } catch (err) {
        alert("File is not a valid JSON file.");
    }
    return null;
}

function readFile(file, callback) {
    if (!file) {
        alert("No file given.");
        return false;
    }

    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = callback;
    return true;
}

export {safeParseJson,readFile};