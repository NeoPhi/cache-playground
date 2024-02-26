import { SigFig } from "@synap/sig-fig-calculator";
import * as readline from "node:readline/promises";
import {
  CACHES,
  Cache,
  CacheName,
  Key,
  parseCacheNames,
  parseCacheSize,
} from "./caches";

class Stats {
  readonly name: string;
  hitCount = 0;
  missCount = 0;

  constructor(name: string) {
    this.name = name;
  }

  report() {
    const totalCount = this.hitCount + this.missCount;
    return {
      name: this.name,
      hitCount: this.hitCount,
      hitRatio: `${SigFig.divide(this.hitCount.toString(), totalCount)
        .multiply(100)
        .toFixed()}%`,
      // hitRatio: `${((this.hitCount / totalCount) * 100).toFixed(3)}%`,
    };
  }
}

class Caches {
  caches: Cache[];
  stats: Stats[];

  constructor(cacheNames: CacheName[], maxSize: number) {
    this.caches = cacheNames.map((name) => CACHES[name](maxSize));
    this.stats = cacheNames.map((name) => new Stats(name));
  }

  getOrSet(key: Key) {
    this.caches.forEach((cache, index) => {
      const value = cache.get(key);
      if (value) {
        this.stats[index].hitCount += 1;
      } else {
        this.stats[index].missCount += 1;
        cache.set(key, key);
      }
    });
  }

  report() {
    console.table(
      this.stats.reduce((memo, stats) => {
        const cacheStats = stats.report();
        memo[cacheStats.name] = cacheStats;
        return memo;
      }, {} as { [key: string]: {} }),
      ["hitCount", "hitRatio"]
    );
  }
}

async function exercise(names: (keyof typeof CACHES)[]) {
  const file = readline.createInterface({
    input: process.stdin,
  });
  const caches = new Caches(names, parseCacheSize());
  for await (const key of file) {
    if (key) {
      caches.getOrSet(key);
    }
  }
  caches.report();
}

exercise(parseCacheNames()).then(() => process.exit(0));
