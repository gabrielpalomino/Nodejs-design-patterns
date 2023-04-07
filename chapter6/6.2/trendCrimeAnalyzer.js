import { Analyzer } from "./analyzer.js";

export class TrendCrimeAnalyzer extends Analyzer {
  _transform(record, enc, cb) {
    const current = +record.value;
    if (current && !isNaN(current)) {
      const last = +this.map.get(record.year) || 0;
      this.map.set(record.year, current + last);
    }
    cb();
  }
  _flush(cb) {
    const sortedYears = Array.from(this.map.keys()).sort((a, b) => a - b);
    const firstYearValue = +this.map.get(sortedYears[0]);
    const lastYearValue = +this.map.get(sortedYears[sortedYears.length - 1]);
    const increasing = lastYearValue > firstYearValue;
    this.result = increasing ? "Crime goes up." : "Crime goes down.";
    cb();
  }
}
