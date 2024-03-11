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
console.log(
  [
    "cacheSize",
    "cacheName",
    "hashType",
    "heapUsedMean",
    "heapOverhead",
    "heapOverheadPercentage",
  ].join(",")
);
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
Object.entries(results).forEach(([cacheSizeString, cacheNames]) => {
  const cacheSize = parseInt(cacheSizeString, 10);
  const rows: Rows = {};
  let mapMean = 0;
  let objectMean = 0;
  Object.entries(cacheNames).forEach(([cacheName, data]) => {
    const { resultCount, heapUsedTotal } = data;
    const heapUsedMean = Math.floor(heapUsedTotal / resultCount);
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
  const outputOrder = Object.keys(rows).sort();
  outputOrder.forEach((cacheName) => {
    const { heapUsedMean, usesObject } = rows[cacheName];
    const baseline = usesObject ? objectMean : mapMean;
    const heapOverhead = heapUsedMean - baseline;
    const overheadPercent = ((heapUsedMean * 100) / baseline).toFixed(2);
    console.log(
      [
        cacheSize,
        cacheName,
        usesObject ? "Object" : "Map",
        heapUsedMean,
        heapOverhead,
        overheadPercent,
      ].join(",")
    );
  });
});
