import { readFileSync } from "fs";

const lines = readFileSync("./ops.ldjson").toString().split("\n");
console.log(
  [
    "workload",
    "cacheSize",
    "scenario",
    "cacheName",
    "hitRatio",
    "getCount",
    "getMean",
    "setCount",
    "setMean",
    "totalTime",
    "percentOfMaxTotalTime",
  ].join(",")
);
const results: any = {};
lines.forEach((line) => {
  if (line) {
    const {
      workload,
      cacheName,
      cacheSize,
      get: { count: getCount, mean: getMean },
      set: { count: setCount, mean: setMean },
    } = JSON.parse(line);
    if (!results[workload]) {
      results[workload] = {};
    }
    if (!results[workload][cacheSize]) {
      results[workload][cacheSize] = {};
    }
    if (!results[workload][cacheSize][cacheName]) {
      results[workload][cacheSize][cacheName] = {
        resultCount: 0,
        getCount,
        getMeanTotal: 0,
        setCount,
        setMeanTotal: 0,
      };
    }
    const data = results[workload][cacheSize][cacheName];
    data.resultCount += 1;
    data.getMeanTotal += getMean;
    data.setMeanTotal += setMean;
  }
});
Object.entries(results).forEach(([workload, cacheSizes]) => {
  Object.entries(cacheSizes!).forEach(([cacheSize, cacheNames]) => {
    const group: any[] = [];
    Object.entries(cacheNames!).forEach(([cacheName, data]) => {
      const { resultCount, getCount, getMeanTotal, setCount, setMeanTotal } =
        data as any;
      const getMean = Math.floor(getMeanTotal / resultCount);
      const setMean = Math.floor(setMeanTotal / resultCount);
      group.push([
        workload,
        cacheSize,
        `${workload} ${cacheSize}`,
        cacheName,
        (((getCount - setCount) * 100) / getCount).toFixed(2),
        getCount,
        getMean,
        setCount,
        setMean,
        getCount * getMean + setCount * setMean,
      ]);
    });
    const maxTotal = Math.max(...group.map((data) => data[data.length - 1]));
    group.forEach((data) => {
      data.push(((data[data.length - 1] / maxTotal) * 100).toFixed(2));
      console.log(data.join(","));
    });
  });
});
