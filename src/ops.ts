import { hrtime } from "node:process";
import * as readline from "node:readline/promises";
import { CACHES, CacheName, parseCacheName, parseCacheSize } from "./caches.js";

async function exercise(name: CacheName) {
  const file = readline.createInterface({
    input: process.stdin,
  });
  const start = hrtime.bigint();
  const cache = CACHES[name](parseCacheSize());
  for await (const key of file) {
    if (key) {
      const value = cache.get(key);
      if (!value) {
        cache.set(key, key);
      }
    }
  }
  const end = hrtime.bigint();
  const nanoseconds = end - start;
  console.table({
    name,
    nanoseconds,
  });
}

await exercise(parseCacheName());
