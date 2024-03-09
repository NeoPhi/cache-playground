# Cache Playground

The goal of this project is to provide a set of common tools to evaluate and experiment with different in-memory key/value caching algorithms and implementations written for JavaScript runtimes. The focus is primarily for server side in-memory caching with browser support noted if known. The playground includes benchmarks but these have varying degrees of confidence explained below.

Unless otherwise noted the playground has only been tested with Node `v20.11.1`.

### Setup

```
yarn install
yarn dist
```

## TODO

This project is still being actively worked on. Two other major components are still in the works.

- [x] Flesh out tooling for hit ratio
- [ ] Flesh out tooling for operations/second
- [ ] Flesh out tooling for implementation memory overhead
- [ ] Improve citations

## Key Considerations

Picking an in-memory cache implementation is highly dependent on the workload that will be used against it and the required features.

### Workload

Understanding how the cache will be used is critical to picking an algorithm that will result in the best results for a given use case.

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

- Input strings are used for the keys and values. This is done to support testing the widest range of implementations which often require keys to be strings. Additionally this allows approximation of memory overhead.
- Restrictions based on key count only. This is done to support testing the widest range of implementations which do not all support limiting total cache size based on approximated memory usage of values and/or keys.

### Hit Ratio (High Confidence)

For a given workload and a cache of a certain size we can measure the hit ratio of the cache. That is how often when we get a value from the cache it is already there. This is a deterministic measurement so we have high confidence when comparing different algorithms, provided no randomness is involved in the caching algorithm. If randomness is involved, pseudorandom number generators with seed support or used to ensure repeatability and many iterations should be examined.

### Operations/Second (Medium Confidence)

For a given implementation of an algorithm how quickly does it perform a given workload as measured in operations per second. Macrobenchmarks are used to ensure any runtime optimizations and garbage collection overhead are factored in. While microbenchmarks play a role, their variability, especially in modern JIT is not the intent of this project.

### Implementation Memory Overhead (Low Confidence)

Accurately measuring the memory of a JavaScript object is tricky since so much is handled by the runtime. The goal is to compare the minimal space needed against an implementation to estimate the memory overhead.

## Workloads

The playground uses a combination of captured workloads and simulated repeatable workloads.

### Captured

A number of high quality cache captures are available online at [https://ftp.pdl.cmu.edu/pub/datasets/twemcacheWorkload/txt/](https://ftp.pdl.cmu.edu/pub/datasets/twemcacheWorkload/txt/). These were originally published as part of the [SIEVE paper](papers/nsdi24-SIEVE.pdf).

### Simulated

These are primarily based on a [power law approximation](papers/0706.1062v2.pdf) or [Zipf's law](https://en.wikipedia.org/wiki/Zipf's_law).

#### Power Law

`node dist/src/power-law.js`

| ENV | Default | Meaning |
| X_MIN | 5 | Minimum integer value |
| ALPHA | 2.5 | [Power law exponent](papers/0706.1062v2.pdf) |
| SEED | 9,954 | mersenne-twister random seed |
| ITERATIONS | 10,000 | How many values to produce |

#### Zipf's Law

`node dist/src/zipf.js`

| ENV | Default | Meaning |
| X_MIN | 1 | Minimum integer value |
| X_MAX | 1,000 | Maximum integer value |
| SKEW | 1.07 | [Skew towards X_MIN](https://github.com/vweevers/zipfian-integer?tab=readme-ov-file#about) |
| SEED | 9,954 | mersenne-twister random seed |
| ITERATIONS | 10,000 | How many values to produce |

## Running

To provide as much flexibility in workload generation the tools read a series of newline delimited keys (typically integers but could be anything) from STDIN and runs them against a comma separated list of cache names to test or all registered caches if none are specified. Caches are defined in [src/caches.ts](src/caches.ts).

### Hit Ratio

`node dist/src/hit-ratio.js`

| ENV | Default | Meaning |
| CACHE_NAMES | | Caches to include in the run |
| CACHE_SIZE | 100 | Limit on number keys in the cache |

Sample simulated workload:

```
node dist/src/power-law.js | node dist/src/hit-ratio.js
Using 2.5 for ALPHA
Using 5 for X_MIN
Using 9,954 for SEED
Using 10,000 for ITERATIONS
Using 100 for CACHE_SIZE
┌───────────────────────────────┬──────────┬──────────┐
│ (index)                       │ hitCount │ hitRatio │
├───────────────────────────────┼──────────┼──────────┤
│ lru-cache                     │ 9779     │ '97.79%' │
│ playground/lru-uint           │ 9779     │ '97.79%' │
│ mnemonist/lru-map-with-delete │ 9779     │ '97.79%' │
│ playground/lru-mid            │ 9782     │ '97.82%' │
│ playground/sieve-uint         │ 9789     │ '97.89%' │
│ playground/sieve-map-entry    │ 9789     │ '97.89%' │
└───────────────────────────────┴──────────┴──────────┘
```

Sample captured workload:

```
zstd -cd ~/Downloads/metaKV.sample100.txt.zst | env CACHE_SIZE=10000 node dist/src/hit-ratio.js
Using 10,000 for CACHE_SIZE
┌───────────────────────────────┬──────────┬──────────────┐
│ (index)                       │ hitCount │ hitRatio     │
├───────────────────────────────┼──────────┼──────────────┤
│ lru-cache                     │ 11583908 │ '88.264446%' │
│ playground/lru-uint           │ 11583908 │ '88.264446%' │
│ mnemonist/lru-map-with-delete │ 11583908 │ '88.264446%' │
│ playground/lru-mid            │ 11658520 │ '88.832958%' │
│ playground/sieve-uint         │ 11679236 │ '88.990805%' │
│ playground/sieve-map-entry    │ 11679236 │ '88.990805%' │
└───────────────────────────────┴──────────┴──────────────┘
```

## Playground

The playground directory is for quickly trying out ideas or implementations. A few of my experiments can be found there for consideration.

## Related Work

https://github.com/dominictarr/bench-lru

## Contributing

Everyone interacting with this project is expected to follow the [code of conduct](CODE_OF_CONDUCT.md).

## License

Released under the [MIT License](LICENSE).
