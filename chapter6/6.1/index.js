import fs from "fs";
import zlib from "zlib";
import { pipeline, Transform } from "stream";
import { promisify } from "util";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const argv = require("minimist")(process.argv.slice(2));

const pipe = promisify(pipeline);

class CompressionResults {
  constructor(algorithm, inputSize, compressedSize, duration) {
    this.algorithm = algorithm;
    this.inputSize = inputSize;
    this.compressedSize = compressedSize;
    this.duration = duration;
    this.compressionRatio = (compressedSize / inputSize).toFixed(2);
  }
}

class Accumulator extends Transform {
  constructor() {
    super();
    this.totalSize = 0;
  }
  _transform(chunk, encoding, callback) {
    this.totalSize += chunk.length;
    callback();
  }
}

async function compressFile(inputFile, algorithm) {
  const compressor = zlib[algorithm]();
  const accumulator = new Accumulator();
  const startTime = Date.now();
  await pipe(fs.createReadStream(inputFile), compressor, accumulator);
  const endTime = Date.now();
  const inputSize = fs.statSync(inputFile).size;
  const compressedSize = accumulator.totalSize;
  const duration = endTime - startTime;
  return new CompressionResults(algorithm, inputSize, compressedSize, duration);
}

async function main() {
  if (argv._.length === 0) {
    console.error("Please provide a file as input.");
    process.exit(1);
  }
  const inputFile = argv._[0];
  try {
    fs.accessSync(inputFile, fs.constants.R_OK);
  } catch (error) {
    console.error("Error: Invalid input file or insufficient permissions.");
    process.exit(1);
  }

  try {
    const algorithms = ["createBrotliCompress", "createDeflate", "createGzip"];
    const results = await Promise.all(
      algorithms.map((algorithm) => compressFile(inputFile, algorithm))
    );
    console.table(results, [
      "algorithm",
      "inputSize",
      "compressedSize",
      "duration",
      "compressionRatio",
    ]);
  } catch (error) {
    console.error("Error: Compression failed.", error);
    process.exit(1);
  }
}

main();


