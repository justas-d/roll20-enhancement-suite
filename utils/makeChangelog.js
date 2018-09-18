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

const changelog = {
    info: {
        title: "",
        media: ""
    },
    changes,
}

fs.writeFile("changelog.json", JSON.stringify(changelog, null, 4), "utf8",
    (e) => e && console.error(e));
