const isspace = c => c === '\n' || c === '\r' || c === '\t' || c === ' ' || c === '\f' || c === '\v';
const isdigit = c => ((c >= '0') && (c <= '9'));

class Lexer {
  readHead: number;
  charStream: string;

  constructor(charStream: string) {
    this.readHead = 0;
    this.charStream = charStream;
  }

  tryMatch(str: string, idx: number) {
    for (let i = 0; i < str.length; i++) {
      if (idx >= this.charStream.length) return null;
      if (this.charStream[idx] !== str[i]) return null;
      idx++;
    }

    return { idx: idx };
  }

  tryMatchEscapedAscii(ret) {
    let start = this.tryMatch("<%%", this.readHead);
    if (!start) {
      return false;
    }

    let numBuffer = "";

    let tempIdx = start.idx;
    while (this.charStream.length > tempIdx && isdigit(this.charStream[tempIdx])) {
      numBuffer += this.charStream[tempIdx++];
    }

    let end = this.tryMatch("%%>", tempIdx);
    if (!end) {
      return false;
    }

    let ascii = parseInt(numBuffer);
    if (ascii === NaN) {
      return false;
    }

    this.readHead = end.idx;
    ret.arg += String.fromCharCode(ascii);

    return true;
  }

  tryMatchEscapedSlashes(ret) {
    let isEscapedSlash = this.tryMatch("[TABLEEXPORT:ESCAPE]", this.readHead);
    if (!isEscapedSlash) {
      return false;
    }

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

    if (this.charStream.length <= this.readHead) {
      return { 
        eof: true 
      };
    }

    if (this.charStream[this.readHead] === '!') {
      // command token
      this.readHead++

      let ret = { 
        command: "" 
      };
      while (true) {
        if (this.charStream.length <= this.readHead) break;
        if (isspace(this.charStream[this.readHead])) break;

        ret.command += this.charStream[this.readHead++];
      }

      ret.command = ret.command.trim();
      return ret;
    } 
    else if (this.charStream[this.readHead] === '-') {
      // arg token
      this.readHead += 2;
      let ret = { 
        arg: "" 
      };

      while (true) {
        if (this.charStream.length <= (this.readHead + 1)) break;
        //if (this.charStream[this.readHead] === '!') break; Note(justas): this is invalid as the arg token can have an exclamation point char
        if (this.charStream[this.readHead] === '\n') break;
        if (this.charStream[this.readHead] === '-' && this.charStream[this.readHead + 1] === '-') break;

        if (this.tryMatchEscapedAscii(ret)) continue;
        if (this.tryMatchEscapedSlashes(ret)) continue;

        ret.arg += this.charStream[this.readHead++];
      }

      ret.arg = ret.arg.trim();
      return ret;
    }

    throw new Error(`Table export lexer matched unknown start of token: ${this.charStream[this.readHead]}`)
    return null;
  }
}

const getArgOrDefault = (args, index, _default) => {
  if(args.length <= index) return _default;
  return args[index].arg;
}

class Parser {
  lexer: Lexer;
  tokenBuffer: any;
  
  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.tokenBuffer = null;
  }

  readArgs(numArgs, who) {
    let tokens = [];

    for (let i = 0; i < numArgs; i++) {
      const token = this.lexer.nextToken();
      if(!("arg" in token)) {
        this.tokenBuffer = token;
        return tokens;
      }

      tokens[i] = token;

      console.log(tokens[i]);

      if (!tokens[i]) { 
        throw new Error(`${who} expected ${numArgs}, got ${i + 1}`);
      }
    }

    return tokens;
  }

  nextStatement() {

    const token = typeof(this.tokenBuffer) !== "undefined" && this.tokenBuffer
      ? this.tokenBuffer
      : this.lexer.nextToken();

    this.tokenBuffer = null;
    let ret: any = {};

    do {
      console.log("starting statement parsing");
      console.log(token);

      if (token.command) {
        if (token.command === "import-table") {
          console.log("Parsing table header");

          ret.table = {};
          const argTokens = this.readArgs(2, "import-table");

          if(argTokens.length <= 0) {
            throw new Error(`Expected to find 1 or 2 arguments to import-table, but received ${argTokens.length}. Lexer is at char position ${this.lexer.readHead}`);
          }

          ret.table.name = argTokens[0].arg;
          ret.table.showplayers = getArgOrDefault(argTokens, 1, "hide") === "show";
          return ret;
        } 
        else if (token.command == "import-table-item") {
          console.log('Parsing table item');
          ret.item = {};
          const argTokens = this.readArgs(4, "import-table-item");

          if(argTokens.length < 2) {
              throw new Error(`Expected to find 2, 3 or 4 arguments to import-table-item, but received ${argTokens.length}.Lexer is at char position ${this.lexer.readHead}`);
          }

          ret.item.tableName = argTokens[0].arg;
          ret.item.name = argTokens[1].arg;
          ret.item.weight = getArgOrDefault(argTokens, 2, 1);
          ret.item.avatar = getArgOrDefault(argTokens, 3, "");
          return ret;
        } 
        else {
          throw new Error(`Unknown TableExport command: ${token.command}`);
        }
      }
      else if (token.eof) {
        ret.eof = true;
        return ret;
      } 
      else {
        throw new Error(`Unexpected token: ${token}. Expected a command token. Lexer is at ${this.lexer.readHead}`);
      }
    } while (token.eof === undefined);

    return { eof: true };
  }
}

class Runtime {
  parser: Parser;

  constructor(charStream: string) {
    this.parser = new Parser(new Lexer(charStream));
  }

  run() {
    let statement = null;
    let tables = {};

    do {
      statement = this.parser.nextStatement();
      if (!statement) return;

      if (statement.eof) {
        break;
      }
      else if (statement.table) {
        tables[statement.table.name] = statement.table;
      } 
      else if (statement.item) {
        let table = tables[statement.item.tableName];

        if (table) {
          table.items = table.items || {};

          delete statement.item.tableName;
          table.items[statement.item.name] = statement.item;
        } 
        else {
          throw new Error(`Table not found: ${statement.item.tableName}`);
        }
      }
    } while (statement.eof === undefined);

    console.log(tables);
    return tables;
  }
}

export namespace TableExportLang {
  export const naiveVerify = (charStream: string) => {
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

  export const parse = (c: string) => new Runtime(c).run();
};
