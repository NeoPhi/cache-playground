import { hrtime, version } from "node:process";
import * as readline from "node:readline/promises";
import { CACHES, CacheName, parseCacheName, parseCacheSize } from "./caches.js";

const INCR = 1n;

async function exercise(cacheName: CacheName) {
  const file = readline.createInterface({
    input: process.stdin,
  });
  let getCount = 0n;
  let getTotal = 0n;
  let setCount = 0n;
  let setTotal = 0n;
  const cacheSize = parseCacheSize();
  const cache = CACHES[cacheName](cacheSize);
  for await (const key of file) {
    if (key) {
      const getStart = hrtime.bigint();
      const value = cache.get(key);
      const getEnd = hrtime.bigint();
      getCount += INCR;
      getTotal += getEnd - getStart;
      if (!value) {
        const setStart = hrtime.bigint();
        cache.set(key, key);
        const setEnd = hrtime.bigint();
        setCount += INCR;
        setTotal += setEnd - setStart;
      }
    }
  }
  if (process.env.OPS_OUTPUT === "json") {
    console.log(
      JSON.stringify({
        nodeVersion: version,
        date: new Date(),
        workload: process.env.OPS_WORKLOAD || "not specified",
        cacheName,
        cacheSize,
        get: {
          count: Number(getCount),
          countString: getCount.toString(),
          mean: Number(getTotal / getCount),
          meanString: (getTotal / getCount).toString(),
        },
        set: {
          count: Number(setCount),
          countString: setCount.toString(),
          mean: Number(setTotal / setCount),
          meanString: (setTotal / setCount).toString(),
        },
      })
    );
  } else {
    console.table({
      get: {
        count: getCount.toLocaleString(),
        mean: (getTotal / getCount).toLocaleString(),
      },
      set: {
        count: setCount.toLocaleString(),
        mean: (setTotal / setCount).toLocaleString(),
      },
    });
  }
}

await exercise(parseCacheName());
