import { readFileSync } from "fs";
import { CacheName, OBJECT_BASED_CACHE } from "./caches.js";

type Row = {
  heapUsedMean: number;
  usesObject: boolean;
  heapOverhead?: number;
  cacheSizeRank?: number;
};
type Rows = { [key: string]: Row };
type Data = { resultCount: number; heapUsedTotal: number };
type Result = { [key: string]: Data };
type Results = { [key: number]: Result };

function rank(rows: Rows, keys: string[]) {
  keys
    .sort((a, b) => rows[a].heapOverhead! - rows[b].heapOverhead!)
    .forEach((cacheName, index) => {
      rows[cacheName].cacheSizeRank = index + 1;
    });
}

const lines = readFileSync("./memory.ldjson").toString().split("\n");
console.log(
  [
    "cacheSize",
    "cacheName",
    "heapUsedMean",
    "heapOverhead",
    "hashType",
    "cacheSizeHashTypeRank",
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
  const objectKeys: string[] = [];
  const mapKeys: string[] = [];
  Object.entries(rows).forEach(([cacheName, row]) => {
    row.heapOverhead =
      row.heapUsedMean - (row.usesObject ? objectMean : mapMean);
    if (row.usesObject) {
      objectKeys.push(cacheName);
    } else {
      mapKeys.push(cacheName);
    }
  });
  rank(rows, objectKeys);
  rank(rows, mapKeys);
  const outputOrder = Object.keys(rows).sort();
  outputOrder.forEach((cacheName) => {
    const { heapUsedMean, heapOverhead, cacheSizeRank } = rows[cacheName];
    console.log(
      [cacheSize, cacheName, heapUsedMean, heapOverhead, cacheSizeRank].join(
        ","
      )
    );
  });
});
