import { hrtime } from "node:process";
import * as readline from "node:readline/promises";
import { CACHES, CacheName, parseCacheName, parseCacheSize } from "./caches.js";

async function exercise(name: CacheName) {
  const file = readline.createInterface({
    input: process.stdin,
  });

  let getCount = 0;
  let getTotal = 0n;
  let setCount = 0;
  let setTotal = 0n;
  const cache = CACHES[name](parseCacheSize());
  for await (const key of file) {
    if (key) {
      getCount += 1;
      const getStart = hrtime.bigint();
      const value = cache.get(key);
      const getEnd = hrtime.bigint();
      getTotal += getEnd - getStart;
      if (!value) {
        setCount += 1;
        const setStart = hrtime.bigint();
        cache.set(key, key);
        const setEnd = hrtime.bigint();
        setTotal += setEnd - setStart;
      }
    }
  }
  console.table({
    name,
    getCount,
    getNanoseconds: getTotal.toLocaleString(),
    setCount,
    setNanoseconds: setTotal.toLocaleString(),
  });
}

await exercise(parseCacheName());
