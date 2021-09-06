import TransformDirname from "./TransformDirname";

export namespace R20Bootstrapper {
  export class Base {

    filename: string;

    constructor(dirname) {
      this.filename = TransformDirname(dirname);
    }

    setup() {}

    // "this" will be the new boostrap, has no access to previous "this"
    disposePrevious() { }

    bootstrap() {
      if(!window.bootstrapTable) return;
      const bootstrapTable = window.bootstrapTable;

      this.disposePrevious();
      console.log(`Adding ${this.filename} to bootstrap table.`);
      window.bootstrapTable[this.filename] = this;
    }

    injectScript(srcUrl, root, id, async) {

      let s = document.createElement("script");
      s.src = srcUrl;
      s.async = async;
      s.id = id;

      if(root) {
        root.appendChild(s);
      }

      return s;
    }

    injectCSS(cssUrl, root, id) {
      let c = document.createElement("link");
      c.rel=  "stylesheet";
      c.id = id;
      c.type = "text/css";
      c.href = cssUrl;
      if(root) {
        root.appendChild(c);
      }

      return c;
    }
  }
}
