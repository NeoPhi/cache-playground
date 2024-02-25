# Cache Playground

The goal of this project is to provide a set of common tools to evaluate and experiment with different in-memory key/value caching algorithms and implementations written for JavaScript runtimes. The focus is primarily for server side in-memory caching with browser support noted if known. The playground includes benchmarks but these have varying degrees of confidence explained below.

## Key Considerations

Picking an in-memory cache implementation is highly dependent on the workload that will be used against it and the required features.

### Workload

Understanding how the cache will be used is critical to picking an algorithm that will result in the best results for your use case.

- total key set size: how many unique keys could be used to access the cache
- working key set size: of all keys how many are typically needed to perform operations
- support for key scanning: does your workload scan over large number of keys at a time resulting in many single access requests
- key access distribution: is key access random, power-law, sequential, bimodal

### Implementation

Because pure JavaScript does not have low-level memory manipulation, common data structures like pointers used to implement caches in other languages require different approaches which result in various tradeoffs.

- cache restriction mechanisms: total key count or support for approximate value size
- bookkeeping overhead: data used by the cache that isn't the raw key and values
- operation overhead: speed of get, set, and eviction operations
- arbitrary key delete support: ability to delete an arbitrary key
- data types supported: restrictions on type of data keys and/or values can be used

## Evaluation

Caches are evaluated with the following caveats:

- Input strings are used for the keys and values. This is done to support testing the widest range of implementations which often require keys to be strings. Additionally this allows us to better approximate memory overhead.
- Restrictions based on key count only. This is done to support testing the widest range of implementations which do not all support limiting total cache size based on approximated memory usage of values and/or keys.

### Hit Ratio (High Confidence)

For a given workload and a cache of a certain size we can measure the hit ratio of the cache. That is how often when we get a value from the cache it is already there. This is a completely deterministic measurement so we have high confidence when comparing different algorithms, provided no randomness is involved in an eviction algorithm. If randomness is involved, given enough samples we can calculate an expected hit ratio with high confidence.

### Operations/Second (Medium Confidence)

For a given implementation of an algorithm how quickly does it perform a given workload as measured in operations per second. We focus on lengthy tests to minimize the impact of when any runtime optimizations may kick in and get a good sense of performance over time.

### Implementation Memory Overhead (Low Confidence)

Accurately measuring the memory of a JavaScript object is tricky since so much is handled by the runtime. We attempt to compare the minimal space needed against an implementation to estimate the overhead.

## Workloads

The playground uses a combination of captured workloads and simulated repeatable workloads.

### Captured

A number of high quality cache captures are available online at [https://ftp.pdl.cmu.edu/pub/datasets/twemcacheWorkload/txt/](https://ftp.pdl.cmu.edu/pub/datasets/twemcacheWorkload/txt/). These were originally published as part of the [SIEVE paper](papers/nsdi24-SIEVE.pdf).

### Simulated

These are primarily based on either [Zipf's law](https://en.wikipedia.org/wiki/Zipf's_law) or [Pareto Type 1](https://en.wikipedia.org/wiki/Pareto_distribution).

## Running

To provide as much flexibility in workload generation the core runner reads a series of newline delimited keys from STDIN and runs them against a comma separated list of cache names to test. Caches are defined in [src/caches.ts](src/caches.ts).

Sample invocation of simulated:

```
env SEED=237 ITERATIONS=1000 ./node_modules/.bin/tsx src/p-type-1.ts | env CACHE_SIZE=10 yarn tsx src/hit-ratio.ts
```

Sample output:

```
Using 10 for CACHE_SIZE
SieveMapEntry 514 / 1000 51.4%
MnemonistLRUMapDelete 413 / 1000 41.3%
SieveUint 514 / 1000 51.4%
LRUCache 413 / 1000 41.3%
LRUUnit 413 / 1000 41.3%
LRUMid 515 / 1000 51.5%
✨  Done in 0.43s.
```

Sample invocation of captured:

```
zstd -cd ./datasets/twemcacheWorkload/txt/metaCDN.sample10.txt.zst | yarn tsx src/hit-ratio.ts
```

Sample output:

```
Using 100000 for CACHE_SIZE
SieveMapEntry 1969181 / 3458656 56.934861402810796%
MnemonistLRUMapDelete 1948521 / 3458656 56.33751954516436%
SieveUint 1969181 / 3458656 56.934861402810796%
LRUCache 1948521 / 3458656 56.33751954516436%
LRUUnit 1948521 / 3458656 56.33751954516436%
LRUMid 1960499 / 3458656 56.683839040367126%
✨  Done in 81.88s.
```

## Playground

The playground directory is for quickly trying out ideas or implementations versus evaluating an established library. A few of my experiments can be found there for consideration.

## TODO

- Flesh out tooling for operations/second
- Flesh out tooling for implementation memory overhead
- Add additional citations

## Contributing

Everyone interacting with this project is expected to follow the [code of conduct](CODE_OF_CONDUCT.md).

## License

Released under the [MIT License](LICENSE).
