import { Analyzer } from "./analyzer.js";

export class DangerousAreasAnalyzer extends Analyzer {
  _transform(record, enc, cb) {
    const current = +record.value;
    if (current && !isNaN(current)) {
      const last = +this.map.get(record.borough) || 0;
      this.map.set(record.borough, current + last);
    }
    cb();
  }
  _flush(cb) {
    const sortedAreas = Array.from(this.map.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);
    this.result = sortedAreas.slice(0, 3).join(", ");
    cb();
  }
}
