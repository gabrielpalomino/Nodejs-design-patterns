import fs from "fs";
import { PassThrough, pipeline, Transform } from "stream";
import { promisify } from "util";
import { parse } from "csv-parse";
import { Analyzer } from "./analyzer.js";
import { TrendCrimeAnalyzer } from "./trendCrimeAnalyzer.js";
import { DangerousAreasAnalyzer } from "./dangerousAreasAnalyzer.js";
import { CommonCrimeAreaAnalyzer } from "./commonCrimeAreaAnalyzer.js";

// Download from https://www.kaggle.com/datasets/jboysen/london-crime
const filename = "london_crime_by_lsoa.csv";
const pipe = promisify(pipeline);

async function run(task, inputStream) {
  if (!(task instanceof Analyzer)) {
    return null;
  }
  const csvParser = parse({ columns: true });
  const connector = new PassThrough();
  inputStream.pipe(connector);
  await pipe(connector, csvParser, task);
}

async function main() {
  try {
    await fs.promises.access(filename, fs.constants.R_OK);
  } catch (error) {
    console.error("Error: Invalid input file or insufficient permissions.");
    process.exit(1);
  }
  const tasks = [
    new TrendCrimeAnalyzer("Did the number of crimes go up or down over the years?"),
    new DangerousAreasAnalyzer("What are the most dangerous areas of London?"),
    new CommonCrimeAreaAnalyzer("What is the most common crime per area?"),
  ];
  const inputStream = fs.createReadStream(filename);
  await Promise.all(tasks.map((task) => run(task, inputStream)));
  tasks.forEach((task) => task.print());
}

main();
