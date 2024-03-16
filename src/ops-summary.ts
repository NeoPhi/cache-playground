import { readFileSync } from "fs";

const lines = readFileSync("./ops.ldjson").toString().split("\n");
const columns = {
  workload: ":---",
  cacheSize: "---:",
  cacheName: ":---:",
  getMean: "---:",
  setMean: "---:",
  totalTime: "---:",
  weightedTotalTime: "---:",
  percentOfMaxTotalTime: "---:",
  percentOfMaxWeightedTotalTime: "---:",
};
const columnNames = Object.keys(columns);
console.log(`|${columnNames.join("|")}|`);
console.log(`|${Object.values(columns).join("|")}|`);
const results: any = {};
lines.forEach((line) => {
  if (line) {
    const {
      workload,
      cacheSize,
      cacheName,
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
Object.keys(results)
  .sort()
  .forEach((workload, index) => {
    if (index >= 1) {
      console.log(`|**${columnNames.join("**|**")}**|`);
    }
    const cacheSizeResults = results[workload];
    Object.keys(cacheSizeResults)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .forEach((cacheSizeString) => {
        const cacheNameResults = cacheSizeResults[cacheSizeString];
        const group: any[] = [];
        Object.keys(cacheNameResults)
          .sort()
          .forEach((cacheName) => {
            const {
              resultCount,
              getCount,
              getMeanTotal,
              setCount,
              setMeanTotal,
            } = cacheNameResults[cacheName];
            const getMean = Math.floor(getMeanTotal / resultCount);
            const setMean = Math.floor(setMeanTotal / resultCount);
            group.push([
              workload,
              parseInt(cacheSizeString, 10).toLocaleString(),
              cacheName,
              getMean.toLocaleString(),
              setMean.toLocaleString(),
              getCount * getMean + setCount * setMean,
              getCount * getMean + setCount * (setMean + 1000000),
            ]);
          });
        const maxTotal = Math.max(
          ...group.map((data) => data[data.length - 2])
        );
        const maxWeightedTotal = Math.max(
          ...group.map((data) => data[data.length - 1])
        );
        group.forEach((data) => {
          const totalTime = data[data.length - 2];
          const weightedTotalTime = data[data.length - 1];
          data[data.length - 2] = totalTime.toLocaleString();
          data[data.length - 1] = weightedTotalTime.toLocaleString();
          data.push(((totalTime / maxTotal) * 100).toFixed(2));
          data.push(((weightedTotalTime / maxWeightedTotal) * 100).toFixed(2));
          console.log(`|${data.join("|")}|`);
        });
      });
  });
