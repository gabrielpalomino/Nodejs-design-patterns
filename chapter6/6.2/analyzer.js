import { Transform } from "stream";

export class Analyzer extends Transform {
  constructor(description, options = {}) {
    options.objectMode = true;
    super(options);
    this.description = description;
    this.map = new Map();
    this.result = undefined;
  }
  print() {
    console.log("");
    console.log(`> ${this.description}`);
    console.log("");
    console.log(`${this.result}`);
    console.log("-");
  }
}
