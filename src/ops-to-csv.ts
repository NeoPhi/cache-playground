import { readFileSync } from "fs";

const lines = readFileSync("./ops.ldjson").toString().split("\n");
console.log(
  [
    "scenario",
    "cacheName",
    "getMean",
    "setMean",
    "totalTime",
    "weightedTotalTime",
    "percentOfMaxTotalTime",
    "percentOfMaxWeightedTotalTime",
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
        `${workload} ${cacheSize}`,
        cacheName,
        getMean,
        setMean,
        getCount * getMean + setCount * setMean,
        getCount * getMean + setCount * (setMean + 1000000),
      ]);
    });
    const maxTotal = Math.max(...group.map((data) => data[data.length - 2]));
    const maxWeightedTotal = Math.max(
      ...group.map((data) => data[data.length - 1])
    );
    group.forEach((data) => {
      data.push(((data[data.length - 2] / maxTotal) * 100).toFixed(2));
      data.push(((data[data.length - 2] / maxWeightedTotal) * 100).toFixed(2));
      console.log(data.join(","));
    });
  });
});
