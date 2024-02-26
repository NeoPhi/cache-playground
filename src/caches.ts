import { LRUCache } from "lru-cache";
import MnemonistLRUMapDelete from "mnemonist/lru-map-with-delete";
import { LRUMid } from "../playground/lru-mid";
import { LRUUnit } from "../playground/lru-uint";
import { Sieve as SieveMapEntry } from "../playground/sieve-map-entry";
import { Sieve as SieveUint } from "../playground/sieve-uint";
import { parseIntFromEnv } from "./utilities";

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
    new MnemonistLRUMapDelete<Key, Value>(n),

  // LRU Mid Point Insertion
  "playground/lru-mid": (n: number) => new LRUMid<Key, Value>(n),

  // SIEVE
  "playground/sieve-uint": (n: number) => new SieveUint<Key, Value>(n),
  "playground/sieve-map-entry": (n: number) => new SieveMapEntry<Key, Value>(n),
};

export type CacheName = keyof typeof CACHES;

export function parseCacheNames(): CacheName[] {
  const names = process.env["CACHE_NAMES"];
  if (!names) {
    return Object.keys(CACHES) as CacheName[];
  }
  const cacheNames = names.split(",");
  cacheNames.forEach((cacheName) => {
    if (!Object.hasOwn(CACHES, cacheName)) {
      throw new Error(`Cache named '${cacheName}' not found.`);
    }
  });
  return cacheNames as CacheName[];
}

export function parseCacheSize(): number {
  return parseIntFromEnv("CACHE_SIZE", 100);
}
