import { readFileSync } from "fs";

const lines = readFileSync("./ops.ldjson").toString().split("\n");
const columns = {
  workload: ":---",
  cacheSize: "---:",
  algorithm: ":---:",
  hitRatio: "---:",
};
const columnNames = Object.keys(columns);
if (process.env.HR_OUTPUT === "md") {
  console.log(`|${columnNames.join("|")}|`);
  console.log(`|${Object.values(columns).join("|")}|`);
} else {
  console.log(columnNames.join(","));
}
const cacheNameToAlgorithm = new Map(
  Object.entries({
    "playground/lru-uint": "LRU",
    "neophi/sieve-cache": "SIEVE",
  })
);
const seen = new Set();
const results: any[] = [];
lines.forEach((line) => {
  if (line) {
    const {
      workload,
      cacheName,
      cacheSize,
      get: { count: getCount },
      set: { count: setCount },
    } = JSON.parse(line);
    const algorithm = cacheNameToAlgorithm.get(cacheName);
    if (!algorithm) {
      return;
    }
    const data = [workload, cacheSize, algorithm];
    const key = data.join(":");
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    data.push((((getCount - setCount) * 100) / getCount).toFixed(2));
    results.push(data);
  }
});

results.sort(
  (a, b) => a[0].localeCompare(b[0]) || a[1] - b[1] || a[2].localeCompare(b[2])
);
const format = process.env.HR_OUTPUT === "md" ? "toLocaleString" : "toString";
results.forEach((data) => {
  data[1] = data[1][format]();
  if (process.env.HR_OUTPUT === "md") {
    console.log(`|${data.join("|")}|`);
  } else {
    console.log(data.join(","));
  }
});
