import { deepStrictEqual } from "node:assert";
import { CacheFactory } from "../../src/caches";

export function smokeTest(cacheFactory: CacheFactory<string, string>) {
  let sieve = cacheFactory(7);
  // Prime the cache
  sieve.set("A", "A");
  sieve.set("B", "B");
  sieve.set("C", "C");
  sieve.set("D", "D");
  sieve.set("E", "E");
  sieve.set("F", "F");
  sieve.set("G", "G");
  // Mark A, B, and G as visited
  sieve.get("A");
  sieve.get("B");
  sieve.get("G");
  deepStrictEqual(
    new Set(sieve.keys()),
    new Set(["A", "B", "C", "D", "E", "F", "G"])
  );
  // Clear visited on A and B, C gets removed, H is added
  sieve.set("H", "H");
  deepStrictEqual(
    new Set(sieve.keys()),
    new Set(["A", "B", "D", "E", "F", "G", "H"])
  );
  // Mark A and D as visited
  sieve.get("A");
  sieve.get("D");
  // Clear visited on D, E gets removed, I is added
  sieve.set("I", "I");
  deepStrictEqual(
    new Set(sieve.keys()),
    new Set(["A", "B", "D", "F", "G", "H", "I"])
  );
  // Mark B as visited, F gets removed, J is added
  sieve.get("B");
  sieve.set("J", "J");
  deepStrictEqual(
    new Set(sieve.keys()),
    new Set(["A", "B", "D", "G", "H", "I", "J"])
  );

  sieve = cacheFactory(2);
  // Prime the cache and mark A as visited
  sieve.set("a", "a");
  sieve.get("a");
  deepStrictEqual(new Set(sieve.keys()), new Set(["a"]));
  // Add C, cache now at capacity
  sieve.set("c", "c");
  deepStrictEqual(new Set(sieve.keys()), new Set(["a", "c"]));
  // Clear visited on A, C gets removed, B is added
  sieve.set("b", "b");
  deepStrictEqual(new Set(sieve.keys()), new Set(["a", "b"]));
  // Hand loops around, A gets removed, C is added
  sieve.set("c", "c");
  deepStrictEqual(new Set(sieve.keys()), new Set(["b", "c"]));
}
