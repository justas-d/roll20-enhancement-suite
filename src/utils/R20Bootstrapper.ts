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
  }
}
