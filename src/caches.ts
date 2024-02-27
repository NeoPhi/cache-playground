import { LRUCache } from "lru-cache";
import mnemonist from "mnemonist";
import { LRUMid } from "../playground/lru-mid.js";
import { LRUUnit } from "../playground/lru-uint.js";
import { Sieve as SieveMapEntry } from "../playground/sieve-map-entry.js";
import { Sieve as SieveUint } from "../playground/sieve-uint.js";
import { parseIntFromEnv } from "./utilities.js";

export type Key = string;
export type Value = string;

export interface Cache<K = Key, V = Value> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  delete(key: K): void;
  keys(): IterableIterator<K>;
}

export type CacheFactory<K, V> = (maxSize: number) => Cache<K, V>;

export const CACHES = {
  // LRU
  "lru-cache": (n: number) => new LRUCache<Key, Value>({ max: n }),
  "playground/lru-uint": (n: number) => new LRUUnit<Key, Value>(n),
  "mnemonist/lru-map-with-delete": (n: number) =>
    new mnemonist.LRUMapWithDelete<Key, Value>(n),

  // LRU Mid Point Insertion
  "playground/lru-mid": (n: number) => new LRUMid<Key, Value>(n),

  // SIEVE
  "playground/sieve-uint": (n: number) => new SieveUint<Key, Value>(n),
  "playground/sieve-map-entry": (n: number) => new SieveMapEntry<Key, Value>(n),
};

export type CacheName = keyof typeof CACHES;

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
