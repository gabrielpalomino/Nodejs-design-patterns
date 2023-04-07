import { Analyzer } from "./analyzer.js";

export class CommonCrimeAreaAnalyzer extends Analyzer {
  _transform(record, enc, cb) {
    const current = +record.value;
    if (current && !isNaN(current)) {
      const existingArea = this.map.get(record.borough) || new Map();
      const last = +existingArea.get(record.major_category) || 0;
      existingArea.set(record.major_category, current + last);
      this.map.set(record.borough, existingArea);
    }
    cb();
  }
  _flush(cb) {
    this.result = "";
    for (const area of this.map.keys()) {
      this.result += `${area}:\n`;
      const crimes = this.map.get(area);
      const sortedCrimes = Array.from(crimes.entries()).sort((a, b) => b[1] - a[1]);
      this.result += sortedCrimes.join(" | ");
      this.result += "\n";
    }
    cb();
  }
}
