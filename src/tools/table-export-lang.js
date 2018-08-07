const isspace = c => c === '\n' || c === '\r' || c === '\t' || c === ' ' || c === '\f' || c === '\v';
const isdigit = c => ((c >= '0') && (c <= '9'));

class Lexer {
    constructor(charStream) {
        this.readHead = 0;
        this.charStream = charStream;
    }

    tryMatch(str, idx) {

        for (let i = 0; i < str.length; i++) {
            if (idx >= this.charStream.length) return null;
            if (this.charStream[idx] !== str[i]) return null;
            idx++;
        }

        return { idx: idx };
    }

    tryMatchEscapedAscii(ret) {
        let start = this.tryMatch("<%%", this.readHead);
        if (!start)
            return false;
        let numBuffer = "";

        let tempIdx = start.idx;
        while (this.charStream.length > tempIdx && isdigit(this.charStream[tempIdx])) {
            numBuffer += this.charStream[tempIdx++];
        }

        let end = this.tryMatch("%%>", tempIdx);
        if (!end)
            return false;

        let ascii = parseInt(numBuffer);
        if (ascii === NaN)
            return false;

        this.readHead = end.idx;
        ret.arg += String.fromCharCode(ascii);

        return true;
    }

    tryMatchEscapedSlashes(ret) {
        let isEscapedSlash = this.tryMatch("[TABLEEXPORT:ESCAPE]", this.readHead);
        if (!isEscapedSlash) return false;

        this.readHead = isEscapedSlash.idx;
        ret.arg += "--";

        return true;
    }

    nextToken() {
        while (true) {
            if (this.charStream.length <= this.readHead) {
                break;
            }

            const isExcl = this.charStream[this.readHead] === '!';
            const isDashes = this.charStream.length > (this.readHead + 1) && (this.charStream[this.readHead] === '-' && this.charStream[this.readHead + 1] === '-');

            if (isExcl || isDashes) break;

            this.readHead++;
        }

        if (this.charStream.length <= this.readHead) return { eof: true };

        if (this.charStream[this.readHead] === '!') {
            // command token
            this.readHead++

            let ret = { command: "" };
            while (true) {
                if (this.charStream.length <= this.readHead) break;
                if (isspace(this.charStream[this.readHead])) break;

                ret.command += this.charStream[this.readHead++];
            }

            ret.command = ret.command.trim();
            return ret;

        } else if (this.charStream[this.readHead] === '-') {
            // arg token
            this.readHead += 2;
            let ret = { arg: "" };

            while (true) {
                if (this.charStream.length <= (this.readHead + 1)) break;
                if (this.charStream[this.readHead] === '!') break;
                if (this.charStream[this.readHead] === '-' && this.charStream[this.readHead + 1] === '-') break;

                if (this.tryMatchEscapedAscii(ret)) continue;
                if (this.tryMatchEscapedSlashes(ret)) continue;

                ret.arg += this.charStream[this.readHead++];
            }

            ret.arg = ret.arg.trim();
            return ret;
        }

        alert(`Table export lexer matched unknown start of token: ${this.charStream[this.readHead]}`);
        return null;
    }
}

class Parser {
    constructor(lexer) {
        this.lexer = lexer;
    }

    readArgs(numArgs, who) {
        let tokens = [];

        for (let i = 0; i < numArgs; i++) {
            tokens[i] = this.lexer.nextToken();
            if (!tokens[i]) alert(`${who} expected ${numArgs}, got ${i + 1}`);
        }

        return tokens;
    }

    nextStatement() {

        let token = this.lexer.nextToken();
        let ret = {};

        do {
            if (token.command) {
                if (token.command === "import-table") {

                    ret.table = {};
                    let argTokens = this.readArgs(2, "import-table");
                    ret.table.name = argTokens[0].arg;
                    ret.table.showplayers = argTokens[1].arg === "show";
                    return ret;

                } else if (token.command == "import-table-item") {
                    ret.item = {};
                    let argTokens = this.readArgs(4, "import-table-item");
                    ret.item.tableName = argTokens[0].arg;
                    ret.item.name = argTokens[1].arg;
                    ret.item.weight = argTokens[2].arg;
                    ret.item.avatar = argTokens[3].arg;
                    return ret;

                } else {
                    alert(`Unknown TableExport command: ${token.command}`);
                    return null;
                }
            } else if (token.eof) {
                ret.eof = true;
                return ret;
            } else {
                alert(`Unexpected token: ${token}. Expected a command token.`);
                return null;
            }

        } while (token.eof === undefined);
        return { eof: true };
    }
}

class Runtime {
    constructor(charStream) {
        this.parser = new Parser(new Lexer(charStream));
    }

    run() {
        let statement = null;
        let tables = {};

        do {
            statement = this.parser.nextStatement();
            if (!statement) return;
            if (statement.eof) break;

            else if (statement.table) {
                tables[statement.table.name] = statement.table;
            } else if (statement.item) {
                let table = tables[statement.item.tableName];

                if (table) {
                    table.items = table.items || {};

                    delete statement.item.tableName;
                    table.items[statement.item.name] = statement.item;
                } else {
                    alert(`Table not found: ${statement.item.tableName}`);
                }
            }

        } while (statement.eof === undefined);

        return tables;
    }
}

let TableExportLang = {};


TableExportLang.naiveVerify = function (charStream) {
    let idx = 0;
    while (charStream.length > idx && isspace(charStream[idx])) {
        idx++;
    }
    if (charStream[idx] !== '!') {
        alert("File does not contain valid TableExport data. First character must be !.");
        return false;
    }
    return true;
}

TableExportLang.parse = c => new Runtime(c).run()

export {
    Runtime as TokenExportRuntime,
    Lexer as TokenExportLexer,
    Parser as TokenExportParser,
    TableExportLang
};