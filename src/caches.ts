import { LRUCache } from "lru-cache";
import MnemonistLRUMapDelete from "mnemonist/lru-map-with-delete";
import { LRUMid } from "../playground/lru-mid";
import { LRUUnit } from "../playground/lru-uint";
import { Sieve as SieveMapEntry } from "../playground/sieve-map-entry";
import { Sieve as SieveUint } from "../playground/sieve-uint";

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
  SieveMapEntry: (n: number) => new SieveMapEntry<Key, Value>(n),
  MnemonistLRUMapDelete: (n: number) =>
    new MnemonistLRUMapDelete<Key, Value>(n),
  SieveUint: (n: number) => new SieveUint<Key, Value>(n),
  LRUCache: (n: number) => new LRUCache<Key, Value>({ max: n }),
  LRUUnit: (n: number) => new LRUUnit<Key, Value>(n),
  LRUMid: (n: number) => new LRUMid<Key, Value>(n),
};

export type CacheName = keyof typeof CACHES;

export function parseCacheNames(names: string | undefined): CacheName[] {
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

export function parseIntFromEnv(
  key: string,
  defaultValue: number,
  quiet = false
): number {
  let parsedValue = defaultValue;
  const envValue = process.env[key];
  if (envValue) {
    parsedValue = parseInt(envValue, 10);
  }
  if (parsedValue < 1) {
    throw new Error(`${key} must be at least 1`);
  }
  if (!quiet) {
    console.log(`Using ${parsedValue} for ${key}`);
  }
  return parsedValue;
}

export function parseCacheSize(): number {
  return parseIntFromEnv("CACHE_SIZE", 100000);
}
