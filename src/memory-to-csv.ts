import { readFileSync } from "fs";
import { OBJECT_BASED_CACHE } from "./caches.js";

const lines = readFileSync("./memory.ldjson").toString().split("\n");
console.log(
  ["cacheSize", "cacheName", "heapUsedMean", "heapOverhead"].join(",")
);
const results: any = {};
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
Object.entries(results).forEach(([cacheSize, cacheNames]) => {
  const group: any[] = [];
  let mapMean = 0;
  let objectMean = 0;
  Object.entries(cacheNames!).forEach(([cacheName, data]) => {
    const { resultCount, heapUsedTotal } = data as any;
    const heapUsedMean = Math.floor(heapUsedTotal / resultCount);
    if (cacheName === "map") {
      mapMean = heapUsedMean;
    } else if (cacheName === "object") {
      objectMean = heapUsedMean;
    } else {
      group.push([cacheSize, cacheName, heapUsedMean]);
    }
  });
  group.forEach((data) => {
    if (OBJECT_BASED_CACHE.has(data[1])) {
      data.push(data[data.length - 1] - objectMean);
    } else {
      data.push(data[data.length - 1] - mapMean);
    }
    console.log(data.join(","));
  });
});
