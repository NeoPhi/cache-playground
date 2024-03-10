import { version } from "node:process";
import { CACHES, CacheName, parseCacheName, parseCacheSize } from "./caches.js";
import assert, { deepStrictEqual } from "node:assert";

function exercise(cacheName: CacheName) {
  if (typeof gc === "undefined") {
    throw new Error("Must be run with --expose-gc");
  }
  const cacheSize = parseCacheSize();
  const loopCount = 3;
  const keyLength = (cacheSize * loopCount).toString().length;
  const cache = CACHES[cacheName](cacheSize);
  for (let loop = 0; loop < loopCount; loop += 1) {
    if (cacheName === "map" || cacheName === "object") {
      (cache as any).clear();
    }
    const endIndex = cacheSize * (loop + 1);
    for (
      let index = cacheSize * loop;
      index < endIndex;
      index += (loop % 2) + 1
    ) {
      const key = index.toString().padStart(keyLength, "0");
      if (loop === 1) {
        cache.get(key);
      } else {
        cache.set(key, key);
      }
    }
    gc();
  }
  gc();
  const heapUsed = process.memoryUsage().heapUsed;
  if (process.env.MEM_OUTPUT === "json") {
    console.log(
      JSON.stringify({
        nodeVersion: version,
        date: new Date(),
        cacheName,
        cacheSize,
        heapUsed,
      })
    );
  } else {
    console.log(heapUsed.toLocaleString());
  }
  // Maintain a reference until after we call gc() to prevent the cache from being removed
  const assertKey = (cacheSize * loopCount - 1)
    .toString()
    .padStart(keyLength, "0");
  deepStrictEqual(assertKey, cache.get(assertKey));
}

exercise(parseCacheName());
