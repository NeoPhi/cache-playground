# Cache Playground

The goal of this project is to provide a set of common tools to evaluate and experiment with different in-memory key/value caching algorithms and implementations written for JavaScript runtimes. The focus is primarily for server side in-memory caching with browser support noted if known. The playground includes benchmarks but these have varying degrees of confidence explained below.

Unless otherwise noted the playground has only been tested with Node `v20.11.1`.

### Setup

```
yarn install
yarn dist
```

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

### Mean Operation Time (Medium Confidence)

For a given implementation of an algorithm how quickly does it perform a given workload as measured in mean time per operation. Macrobenchmarks are used to ensure any runtime optimizations and garbage collection overhead are factored in. While microbenchmarks play a role, their variability, especially in modern JIT is not the intent of this project.

### Memory Overhead (Low Confidence)

Accurately measuring the memory of a JavaScript object is tricky since so much is handled by the runtime. The goal is to compare the minimal space needed against an implementation to estimate the memory overhead.

## Workloads

The playground uses a combination of captured workloads and simulated repeatable workloads.

### Captured

A number of high quality cache captures are available online at [https://ftp.pdl.cmu.edu/pub/datasets/twemcacheWorkload/txt/](https://ftp.pdl.cmu.edu/pub/datasets/twemcacheWorkload/txt/). These were originally published as part of the [SIEVE paper](papers/nsdi24-SIEVE.pdf).

### Simulated

These are primarily based on a [power law approximation](papers/0706.1062v2.pdf) or [Zipf's law](https://en.wikipedia.org/wiki/Zipf's_law).

#### Power Law

`node dist/src/power-law.js`

| ENV        | Default | Meaning                                      |
| ---------- | ------- | -------------------------------------------- |
| X_MIN      | 5       | Minimum integer value                        |
| ALPHA      | 2.5     | [Power law exponent](papers/0706.1062v2.pdf) |
| SEED       | 9,954   | mersenne-twister random seed                 |
| ITERATIONS | 10,000  | How many values to produce                   |

#### Zipf's Law

`node dist/src/zipf.js`

| ENV        | Default | Meaning                                                                                    |
| ---------- | ------- | ------------------------------------------------------------------------------------------ |
| X_MIN      | 1       | Minimum integer value                                                                      |
| X_MAX      | 1,000   | Maximum integer value                                                                      |
| SKEW       | 1.07    | [Skew towards X_MIN](https://github.com/vweevers/zipfian-integer?tab=readme-ov-file#about) |
| SEED       | 9,954   | mersenne-twister random seed                                                               |
| ITERATIONS | 10,000  | How many values to produce                                                                 |

## Running

To provide as much flexibility in workload generation the tools read a series of newline delimited keys (typically integers but could be anything) from STDIN and runs them against a comma separated list of cache names to test or all registered caches if none are specified. Caches are defined in [src/caches.ts](src/caches.ts).

### Hit Ratio

`node dist/src/hit-ratio.js`

| ENV         | Default | Meaning                           |
| ----------- | ------- | --------------------------------- |
| CACHE_NAMES |         | Caches to include in the run      |
| CACHE_SIZE  | 100     | Limit on number keys in the cache |

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
│ playground/lru-uint           │ 9779     │ '97.79%' │
│ playground/sieve-uint         │ 9789     │ '97.89%' │
└───────────────────────────────┴──────────┴──────────┘
```

Sample captured workload:

```
zstd -cd datasets/twemcacheWorkload/txt/metaKV.sample100.txt.zst | env CACHE_SIZE=100000 CACHE_NAME=node dist/src/ops.js
Using 10,000 for CACHE_SIZE
┌───────────────────────────────┬──────────┬──────────────┐
│ (index)                       │ hitCount │ hitRatio     │
├───────────────────────────────┼──────────┼──────────────┤
│ playground/lru-uint           │ 11583908 │ '88.264446%' │
│ playground/sieve-uint         │ 11679236 │ '88.990805%' │
└───────────────────────────────┴──────────┴──────────────┘
```

### Mean Operation Time

All times are reported in nanoseconds.

`node dist/src/ops.js`

| ENV          | Default       | Meaning                                   |
| ------------ | ------------- | ----------------------------------------- |
| CACHE_NAME   |               | Cache to use                              |
| CACHE_SIZE   | 100           | Limit on number keys in the cache         |
| OPS_OUTPUT   | table         | `json` for JSON, default is console table |
| OPS_WORKLOAD | not specified | workload name to include in JSON output   |

```
zstd -cd datasets/twemcacheWorkload/txt/metaKV.sample100.txt.zst | env CACHE_SIZE=100000 CACHE_NAME=playground/sieve-uint node dist/src/ops.js
Using playground/sieve-uint for CACHE_NAME
Using 100,000 for CACHE_SIZE
┌─────────┬──────────────┬───────┐
│ (index) │ count        │ mean  │
├─────────┼──────────────┼───────┤
│ get     │ '13,124,093' │ '215' │
│ set     │ '696,637'    │ '458' │
└─────────┴──────────────┴───────┘
```

### Memory Overhead

The `process.memoryUsage().heapUsed` in bytes is reported. For calculation of overhead compare against a plain `map` or `object` based on the underlying implementation. The optional `--expose-gc` to node must be passed. The overhead is HIGHLY dependent on the size and type of the keys so customize for your use case.

`node --expose-gc dist/src/memory.js`

| ENV        | Default | Meaning                                 |
| ---------- | ------- | --------------------------------------- |
| CACHE_NAME |         | Cache to use                            |
| CACHE_SIZE | 100     | Limit on number keys in the cache       |
| MEM_OUTPUT | log     | `json` for JSON, default is console log |

```
env CACHE_SIZE=100000 CACHE_NAME=playground/sieve-uint node --expose-gc dist/src/memory.js
Using playground/sieve-uint for CACHE_NAME
Using 100,000 for CACHE_SIZE
15,969,936

env CACHE_SIZE=100000 CACHE_NAME=map node --expose-gc dist/src/memory.js
Using map for CACHE_NAME
Using 100,000 for CACHE_SIZE
10,660,632
```

So in the case of the `playground/sieve-uint` cache the overhead for a `100,000` item string cache is apx. `5,309,304 bytes`.

## Results

All results reported below were captured on a DigitalOcean CPU-Optimized 2 vCPUs machine running Debian 12 and node v20.11.1. Full details in [benchmark.md](benchmark.md).

### Implementations

Any mistakes in classification are mine and corrections are welcome.

| Name                                                                          | Version | Type  | Core HashMap | Notes                         |
| ----------------------------------------------------------------------------- | ------- | ----- | ------------ | ----------------------------- |
| [tiny-lru](https://github.com/avoidwork/tiny-lru)                             | 11.2.5  | LRU   | Object       |                               |
| [lru-cache](https://github.com/isaacs/node-lru-cache)                         | 10.2.0  | LRU   | Map          |                               |
| [playground/lru-uint](playground/lru-uint.ts)                                 | N/A     | LRU   | Map          |                               |
| [mnemonist/lru-cache-with-delete](https://github.com/yomguithereal/mnemonist) | 0.39.8  | LRU   | Object       |                               |
| [mnemonist/lru-map-with-delete](https://github.com/yomguithereal/mnemonist)   | 0.39.8  | LRU   | Map          |                               |
| [js-sieve](playground/js-sieve.ts)                                            | 0.0.4\* | SIEVE | Map          | Modified interface            |
| [playground/sieve-uint](playground/sieve-uint.ts)                             | N/A     | SIEVE | Map          |                               |
| [playground/sieve-map-entry](playground/sieve-map-entry.ts)                   | N/A     | SIEVE | Map          |                               |
| [zf/sieve](playground/zf-sieve-cache.ts)                                      | 1.0.?\* | SIEVE | Map          | Copied and modified interface |

### Memory Overhead

Presented in alphabetical order. `heapUsedMean` and `heapOverhead` are in bytes.

| cacheSize |            cacheName            | hashType | heapUsedMean | heapOverhead | heapOverheadPercentage |
| --------: | :-----------------------------: | :------: | -----------: | -----------: | ---------------------: |
|     1,000 |            js-sieve             |   Map    |    4,769,327 |      134,770 |                 102.91 |
|     1,000 |            lru-cache            |   Map    |    4,708,356 |       73,799 |                 101.59 |
|     1,000 | mnemonist/lru-cache-with-delete |  Object  |    4,704,979 |       49,185 |                 101.06 |
|     1,000 |  mnemonist/lru-map-with-delete  |   Map    |    4,681,853 |       47,296 |                 101.02 |
|     1,000 |       playground/lru-uint       |   Map    |    4,715,087 |       80,530 |                 101.74 |
|     1,000 |   playground/sieve-map-entry    |   Map    |    4,707,678 |       73,121 |                 101.58 |
|     1,000 |      playground/sieve-uint      |   Map    |    4,716,690 |       82,133 |                 101.77 |
|     1,000 |            tiny-lru             |  Object  |    4,718,836 |       63,042 |                 101.35 |
|     1,000 |            zf/sieve             |   Map    |    4,856,458 |      221,901 |                 104.79 |
|           |                                 |          |              |              |                        |
|    10,000 |            js-sieve             |   Map    |    6,847,922 |    1,419,470 |                 126.15 |
|    10,000 |            lru-cache            |   Map    |    6,009,776 |      581,324 |                 110.71 |
|    10,000 | mnemonist/lru-cache-with-delete |  Object  |    5,288,583 |       90,260 |                 101.74 |
|    10,000 |  mnemonist/lru-map-with-delete  |   Map    |    5,954,027 |      525,575 |                 109.68 |
|    10,000 |       playground/lru-uint       |   Map    |    5,974,804 |      546,352 |                 110.06 |
|    10,000 |   playground/sieve-map-entry    |   Map    |    6,297,472 |      869,020 |                 116.01 |
|    10,000 |      playground/sieve-uint      |   Map    |    6,046,410 |      617,958 |                 111.38 |
|    10,000 |            tiny-lru             |  Object  |    5,849,111 |      650,788 |                 112.52 |
|    10,000 |            zf/sieve             |   Map    |    6,787,847 |    1,359,395 |                 125.04 |
|           |                                 |          |              |              |                        |
|   100,000 |            js-sieve             |   Map    |   24,006,937 |   13,351,503 |                 225.30 |
|   100,000 |            lru-cache            |   Map    |   16,080,652 |    5,425,218 |                 150.92 |
|   100,000 | mnemonist/lru-cache-with-delete |  Object  |   11,262,494 |    1,609,447 |                 116.67 |
|   100,000 |  mnemonist/lru-map-with-delete  |   Map    |   15,945,810 |    5,290,376 |                 149.65 |
|   100,000 |       playground/lru-uint       |   Map    |   16,003,612 |    5,348,178 |                 150.19 |
|   100,000 |   playground/sieve-map-entry    |   Map    |   18,410,132 |    7,754,698 |                 172.78 |
|   100,000 |      playground/sieve-uint      |   Map    |   16,007,984 |    5,352,550 |                 150.23 |
|   100,000 |            tiny-lru             |  Object  |   16,321,853 |    6,668,806 |                 169.08 |
|   100,000 |            zf/sieve             |   Map    |   23,228,587 |   12,573,153 |                 218.00 |
|           |                                 |          |              |              |                        |
| 1,000,000 |            js-sieve             |   Map    |  183,397,438 |  125,376,004 |                 316.09 |
| 1,000,000 |            lru-cache            |   Map    |  103,364,414 |   45,342,980 |                 178.15 |
| 1,000,000 | mnemonist/lru-cache-with-delete |  Object  |   70,758,808 |   16,221,431 |                 129.74 |
| 1,000,000 |  mnemonist/lru-map-with-delete  |   Map    |  103,326,676 |   45,305,242 |                 178.08 |
| 1,000,000 |       playground/lru-uint       |   Map    |  103,365,364 |   45,343,930 |                 178.15 |
| 1,000,000 |   playground/sieve-map-entry    |   Map    |  127,416,284 |   69,394,850 |                 219.60 |
| 1,000,000 |      playground/sieve-uint      |   Map    |  103,376,207 |   45,354,773 |                 178.17 |
| 1,000,000 |            tiny-lru             |  Object  |  118,609,333 |   64,071,956 |                 217.48 |
| 1,000,000 |            zf/sieve             |   Map    |  175,430,400 |  117,408,966 |                 302.35 |

## Playground

The playground directory is for quickly trying out ideas or implementations. A few of my experiments can be found there for consideration.

## Related Work

https://github.com/dominictarr/bench-lru

## Contributing

Everyone interacting with this project is expected to follow the [code of conduct](CODE_OF_CONDUCT.md).

## License

Released under the [MIT License](LICENSE).
