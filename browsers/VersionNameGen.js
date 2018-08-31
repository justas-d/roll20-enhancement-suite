module.exports = (origVersionName) => {
    const versionName = origVersionName.replace(/v/g, "");
    let finalVersion = null;

    const dashIndex = versionName.indexOf("-");
    if (dashIndex !== -1) {
        finalVersion = versionName.substring(0, dashIndex);
    } else {
        finalVersion = versionName;
    }

    const rcString = "-rc."
    const rcIndex = versionName.indexOf(rcString);
    if (rcIndex !== -1) {
        let idx = rcIndex + rcString.length;
        let numBuf = "";
        const isdigit = c => ((c >= '0') && (c <= '9'));

        do {
            const char = versionName.charAt(idx);
            console.log(char);
            if (versionName.length > idx && isdigit(char)) {
                idx++;
                numBuf += char;
            } else { break; }

        } while (true);

        //console.log(numBuf);
        //console.log(`${rcIndex}-${idx}/${versionName.length}`);

        if (numBuf.length > 0) {
            finalVersion += `.${numBuf}`
        }
    }

    return finalVersion;
}
