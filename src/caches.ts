import { LRUCache } from "lru-cache";
import mnemonist from "mnemonist";
import { LRUMid } from "../playground/lru-mid.js";
import { LRUUnit } from "../playground/lru-uint.js";
import { Sieve as SieveMapEntry } from "../playground/sieve-map-entry.js";
import { SieveCache as NeoPhiSieveCache } from "@neophi/sieve-cache";
import { parseIntFromEnv } from "./utilities.js";
import { lru } from "tiny-lru";
import { Sieve } from "../playground/js-sieve.js";
import { ObjectAdapter } from "../playground/object-adapter.js";
import { SieveCache } from "../playground/zf-sieve-cache.js";

// quick-lru removed since it does not correctly enforce maxSize
// https://github.com/sindresorhus/quick-lru/issues/17
// import QuickLRU from "quick-lru";

export type Key = string;
export type Value = string;

export interface Cache<K = Key, V = Value> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  delete(key: K): void;
}

export interface CacheKeys<K = Key, V = Value> extends Cache<K, V> {
  keys(): IterableIterator<K> | K[];
}

export type CacheFactory<K, V, C extends Cache<K, V>> = (maxSize: number) => C;

export const CACHES = {
  // Unlimited
  map: () => new Map(),
  object: () => new ObjectAdapter<Key, Value>(),

  // LRU
  "tiny-lru": (n: number) => lru<Value>(n),
  "lru-cache": (n: number) => new LRUCache<Key, Value>({ max: n }),
  "playground/lru-uint": (n: number) => new LRUUnit<Key, Value>(n),
  "mnemonist/lru-cache-with-delete": (n: number) =>
    new mnemonist.LRUCacheWithDelete<Key, Value>(n),
  "mnemonist/lru-map-with-delete": (n: number) =>
    new mnemonist.LRUMapWithDelete<Key, Value>(n),

  // LRU Mid Point Insertion
  "playground/lru-mid": (n: number) => new LRUMid<Key, Value>(n),

  // SIEVE
  "js-sieve": (n: number) => new Sieve<Key, Value>(n),
  "neophi/sieve-cache": (n: number) => new NeoPhiSieveCache<Key, Value>(n),
  "playground/sieve-map-entry": (n: number) => new SieveMapEntry<Key, Value>(n),
  "zf/sieve": (n: number) => new SieveCache<Value, Key>(n),
};

export type CacheName = keyof typeof CACHES;

export const OBJECT_BASED_CACHE: Set<CacheName> = new Set([
  "tiny-lru",
  "mnemonist/lru-cache-with-delete",
]);

export function parseCacheName(): CacheName {
  const cacheName = process.env["CACHE_NAME"];
  if (!cacheName || !Object.hasOwn(CACHES, cacheName)) {
    throw new Error(`Cache named '${cacheName}' not found.`);
  }
  console.warn(`Using ${cacheName} for CACHE_NAME`);
  return cacheName as CacheName;
}

export function parseCacheNames(): CacheName[] {
  let cacheNames: CacheName[];
  const names = process.env["CACHE_NAMES"];
  if (!names) {
    cacheNames = Object.keys(CACHES) as CacheName[];
  } else {
    cacheNames = names.split(",") as CacheName[];
    cacheNames.forEach((cacheName) => {
      if (!Object.hasOwn(CACHES, cacheName)) {
        throw new Error(`Cache named '${cacheName}' not found.`);
      }
    });
  }
  console.warn(`Using ${cacheNames} for CACHE_NAMES`);
  return cacheNames;
}

export function parseCacheSize(): number {
  return parseIntFromEnv("CACHE_SIZE", 100);
}
