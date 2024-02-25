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
    console.log(
      `${this.name} ${this.hitCount} / ${totalCount} ${
        (this.hitCount / totalCount) * 100
      }%`
    );
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
    this.stats.forEach((stats) => {
      stats.report();
    });
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

exercise(parseCacheNames(process.argv[2])).then(() => process.exit(0));
