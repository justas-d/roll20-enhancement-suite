const fs = require("fs");
const shell = require("shelljs");

const changes = shell.exec("sh utils/makeChangelog.sh")
    .stdout.split("\n").map(c => {
    c = c.trim();

    return {
        id: "",
        content: c,
    };
});

const version = shell.exec("git describe --abbrev=0").trim();

let prevChangelog = {
    versions: {}
};

try {
    prevChangelog = JSON.parse(fs.readFileSync("changelog.json", "utf8", e => {
        if (e) console.log(e);
    }));
} catch(err) {
    console.log(`Failed parsing changelog ${err}`);
}

prevChangelog.current = version;
prevChangelog.versions[version] = {
    info: {
        title: "",
        media: ""
    },
    changes,
};

fs.writeFile("changelog.json", JSON.stringify(prevChangelog, null, 4), "utf8",
    (e) => e && console.error(e));
