import { readFileSync } from "fs";
import { CacheName, OBJECT_BASED_CACHE } from "./caches.js";

type Row = {
  heapUsedMean: number;
  usesObject: boolean;
};
type Rows = { [key: string]: Row };
type Data = { resultCount: number; heapUsedTotal: number };
type Result = { [key: string]: Data };
type Results = { [key: number]: Result };

const lines = readFileSync("./memory.ldjson").toString().split("\n");
const columns = {
  cacheSize: "---:",
  cacheName: ":---:",
  hashType: ":---:",
  heapUsedMean: "---:",
  heapOverhead: "---:",
  heapOverheadPercentage: "---:",
};
const columnNames = Object.keys(columns);
if (process.env.MEM_OUTPUT === "md") {
  console.log(`|${columnNames.join("|")}|`);
  console.log(`|${Object.values(columns).join("|")}|`);
} else {
  console.log(columnNames.join(","));
}
const results: Results = {};
lines.forEach((line) => {
  if (line) {
    const { cacheName, cacheSize, heapUsed } = JSON.parse(line);
    if (!results[cacheSize]) {
      results[cacheSize] = {};
    }
    if (!results[cacheSize][cacheName]) {
      results[cacheSize][cacheName] = {
        resultCount: 0,
        heapUsedTotal: 0,
      };
    }
    const data = results[cacheSize][cacheName];
    data.resultCount += 1;
    data.heapUsedTotal += heapUsed;
  }
});
Object.entries(results).forEach(([cacheSizeString, cacheNames], index) => {
  const cacheSize = parseInt(cacheSizeString, 10);
  const rows: Rows = {};
  let mapMean = 0;
  let objectMean = 0;
  Object.entries(cacheNames).forEach(([cacheName, data]) => {
    const { resultCount, heapUsedTotal } = data;
    const heapUsedMean = Math.ceil(heapUsedTotal / resultCount);
    if (cacheName === "map") {
      mapMean = heapUsedMean;
    } else if (cacheName === "object") {
      objectMean = heapUsedMean;
    } else {
      rows[cacheName] = {
        heapUsedMean,
        usesObject: OBJECT_BASED_CACHE.has(cacheName as CacheName),
      };
    }
  });
  if (index >= 1 && process.env.MEM_OUTPUT === "md") {
    console.log(`|**${columnNames.join("**|**")}**|`);
  }
  const outputOrder = Object.keys(rows).sort(
    (a, b) =>
      (rows[a].usesObject ? 0 : 1) - (rows[b].usesObject ? 0 : 1) ||
      a.localeCompare(b)
  );
  outputOrder.forEach((cacheName) => {
    const { heapUsedMean, usesObject } = rows[cacheName];
    const baseline = usesObject ? objectMean : mapMean;
    const heapOverhead = heapUsedMean - baseline;
    const overheadPercent = ((heapUsedMean * 100) / baseline).toFixed(2);
    const format =
      process.env.MEM_OUTPUT === "md" ? "toLocaleString" : "toString";
    const data = [
      cacheSize[format](),
      cacheName,
      usesObject ? "Object" : "Map",
      heapUsedMean[format](),
      heapOverhead[format](),
      overheadPercent,
    ];
    if (process.env.MEM_OUTPUT === "md") {
      console.log(`|${data.join("|")}|`);
    } else {
      console.log(data.join(","));
    }
  });
});
