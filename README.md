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

The following workloads are used below.

| workload                           |   totalKeys | uniqueKeys | uniquePercent |      1% |       10% |       25% |
| ---------------------------------- | ----------: | ---------: | ------------: | ------: | --------: | --------: |
| alibabaBlock.sample100.txt.zst     | 192,929,855 |  8,909,997 |         4.62% |  89,100 |   891,000 | 2,227,499 |
| metaCDN.sample10.txt.zst           |   3,458,656 |  1,223,793 |        35.38% |  12,238 |   122,379 |   305,948 |
| metaCDN.txt.zst                    |  45,623,306 | 12,245,127 |        26.84% | 122,451 | 1,224,513 | 3,061,282 |
| metaKV.sample10.txt.zst            | 171,291,137 |  5,197,497 |         3.03% |  51,975 |   519,750 | 1,299,374 |
| metaKV.sample100.txt.zst           |  13,124,093 |    520,066 |         3.96% |   5,201 |    52,007 |   130,017 |
| tencentBlock.sample100.txt.zst     |  28,746,409 |  5,258,664 |        18.29% |  52,587 |   525,866 | 1,314,666 |
| twiter_cluster52.sample100.txt.zst | 141,072,073 |  2,511,546 |         1.78% |  25,115 |   251,155 |   627,887 |

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

### Hit Ratio

Each workload was tested at 1%, 10%, and 25% of the unique keys seen in the entire workload. All hit ratios are calculated based on a cold cache, that is with the cache with no data. Given the different access nature of the workloads the hit ratio varies dramatically.

| workload                           | cacheSize | algorithm | hitRatio |
| :--------------------------------- | --------: | :-------: | -------: |
| alibabaBlock.sample100.txt.zst     |    89,100 |    LRU    |    73.55 |
| alibabaBlock.sample100.txt.zst     |    89,100 |   SIEVE   |    75.15 |
| alibabaBlock.sample100.txt.zst     |   891,000 |    LRU    |    87.10 |
| alibabaBlock.sample100.txt.zst     |   891,000 |   SIEVE   |    87.98 |
| alibabaBlock.sample100.txt.zst     | 2,227,499 |    LRU    |    91.99 |
| alibabaBlock.sample100.txt.zst     | 2,227,499 |   SIEVE   |    92.59 |
| metaCDN.sample10.txt.zst           |    12,238 |    LRU    |    49.52 |
| metaCDN.sample10.txt.zst           |    12,238 |   SIEVE   |    50.01 |
| metaCDN.sample10.txt.zst           |   122,379 |    LRU    |    57.06 |
| metaCDN.sample10.txt.zst           |   122,379 |   SIEVE   |    57.67 |
| metaCDN.sample10.txt.zst           |   305,948 |    LRU    |    60.91 |
| metaCDN.sample10.txt.zst           |   305,948 |   SIEVE   |    60.83 |
| metaCDN.txt.zst                    |   122,451 |    LRU    |    61.68 |
| metaCDN.txt.zst                    |   122,451 |   SIEVE   |    62.06 |
| metaCDN.txt.zst                    | 1,224,513 |    LRU    |    67.40 |
| metaCDN.txt.zst                    | 1,224,513 |   SIEVE   |    67.87 |
| metaCDN.txt.zst                    | 3,061,282 |    LRU    |    70.34 |
| metaCDN.txt.zst                    | 3,061,282 |   SIEVE   |    70.29 |
| metaKV.sample10.txt.zst            |    51,975 |    LRU    |    88.70 |
| metaKV.sample10.txt.zst            |    51,975 |   SIEVE   |    89.48 |
| metaKV.sample10.txt.zst            |   519,750 |    LRU    |    94.64 |
| metaKV.sample10.txt.zst            |   519,750 |   SIEVE   |    94.99 |
| metaKV.sample10.txt.zst            | 1,299,374 |    LRU    |    95.87 |
| metaKV.sample10.txt.zst            | 1,299,374 |   SIEVE   |    96.23 |
| metaKV.sample100.txt.zst           |     5,201 |    LRU    |    85.34 |
| metaKV.sample100.txt.zst           |     5,201 |   SIEVE   |    86.35 |
| metaKV.sample100.txt.zst           |    52,007 |    LRU    |    93.00 |
| metaKV.sample100.txt.zst           |    52,007 |   SIEVE   |    93.47 |
| metaKV.sample100.txt.zst           |   130,017 |    LRU    |    94.61 |
| metaKV.sample100.txt.zst           |   130,017 |   SIEVE   |    95.07 |
| tencentBlock.sample100.txt.zst     |    52,587 |    LRU    |    63.31 |
| tencentBlock.sample100.txt.zst     |    52,587 |   SIEVE   |    65.71 |
| tencentBlock.sample100.txt.zst     |   525,866 |    LRU    |    93.02 |
| tencentBlock.sample100.txt.zst     |   525,866 |   SIEVE   |    94.08 |
| tencentBlock.sample100.txt.zst     | 1,314,666 |    LRU    |    96.67 |
| tencentBlock.sample100.txt.zst     | 1,314,666 |   SIEVE   |    97.19 |
| twiter_cluster52.sample100.txt.zst |    25,115 |    LRU    |    90.26 |
| twiter_cluster52.sample100.txt.zst |    25,115 |   SIEVE   |    90.69 |
| twiter_cluster52.sample100.txt.zst |   251,155 |    LRU    |    95.36 |
| twiter_cluster52.sample100.txt.zst |   251,155 |   SIEVE   |    95.59 |
| twiter_cluster52.sample100.txt.zst |   627,887 |    LRU    |    96.80 |
| twiter_cluster52.sample100.txt.zst |   627,887 |   SIEVE   |    96.91 |

### Memory Overhead

Presented in alphabetical order by `hashType`. `heapUsedMean` and `heapOverhead` are in bytes.

|     cacheSize |            cacheName            |   hashType   |     heapUsedMean |     heapOverhead |     heapOverheadPercentage |
| ------------: | :-----------------------------: | :----------: | ---------------: | ---------------: | -------------------------: |
|         1,000 | mnemonist/lru-cache-with-delete |    Object    |        4,704,980 |           49,185 |                     101.06 |
|         1,000 |            tiny-lru             |    Object    |        4,718,836 |           63,041 |                     101.35 |
|         1,000 |            js-sieve             |     Map      |        4,769,328 |          134,770 |                     102.91 |
|         1,000 |            lru-cache            |     Map      |        4,708,356 |           73,798 |                     101.59 |
|         1,000 |  mnemonist/lru-map-with-delete  |     Map      |        4,681,854 |           47,296 |                     101.02 |
|         1,000 |       playground/lru-uint       |     Map      |        4,715,088 |           80,530 |                     101.74 |
|         1,000 |   playground/sieve-map-entry    |     Map      |        4,707,679 |           73,121 |                     101.58 |
|         1,000 |      playground/sieve-uint      |     Map      |        4,716,691 |           82,133 |                     101.77 |
|         1,000 |            zf/sieve             |     Map      |        4,856,459 |          221,901 |                     104.79 |
| **cacheSize** |          **cacheName**          | **hashType** | **heapUsedMean** | **heapOverhead** | **heapOverheadPercentage** |
|        10,000 | mnemonist/lru-cache-with-delete |    Object    |        5,288,584 |           90,260 |                     101.74 |
|        10,000 |            tiny-lru             |    Object    |        5,849,112 |          650,788 |                     112.52 |
|        10,000 |            js-sieve             |     Map      |        6,847,923 |        1,419,470 |                     126.15 |
|        10,000 |            lru-cache            |     Map      |        6,009,776 |          581,323 |                     110.71 |
|        10,000 |  mnemonist/lru-map-with-delete  |     Map      |        5,954,028 |          525,575 |                     109.68 |
|        10,000 |       playground/lru-uint       |     Map      |        5,974,804 |          546,351 |                     110.06 |
|        10,000 |   playground/sieve-map-entry    |     Map      |        6,297,472 |          869,019 |                     116.01 |
|        10,000 |      playground/sieve-uint      |     Map      |        6,046,411 |          617,958 |                     111.38 |
|        10,000 |            zf/sieve             |     Map      |        6,787,848 |        1,359,395 |                     125.04 |
| **cacheSize** |          **cacheName**          | **hashType** | **heapUsedMean** | **heapOverhead** | **heapOverheadPercentage** |
|       100,000 | mnemonist/lru-cache-with-delete |    Object    |       11,262,495 |        1,609,447 |                     116.67 |
|       100,000 |            tiny-lru             |    Object    |       16,321,854 |        6,668,806 |                     169.08 |
|       100,000 |            js-sieve             |     Map      |       24,006,938 |       13,351,503 |                     225.30 |
|       100,000 |            lru-cache            |     Map      |       16,080,652 |        5,425,217 |                     150.92 |
|       100,000 |  mnemonist/lru-map-with-delete  |     Map      |       15,945,811 |        5,290,376 |                     149.65 |
|       100,000 |       playground/lru-uint       |     Map      |       16,003,612 |        5,348,177 |                     150.19 |
|       100,000 |   playground/sieve-map-entry    |     Map      |       18,410,132 |        7,754,697 |                     172.78 |
|       100,000 |      playground/sieve-uint      |     Map      |       16,007,984 |        5,352,549 |                     150.23 |
|       100,000 |            zf/sieve             |     Map      |       23,228,588 |       12,573,153 |                     218.00 |
| **cacheSize** |          **cacheName**          | **hashType** | **heapUsedMean** | **heapOverhead** | **heapOverheadPercentage** |
|     1,000,000 | mnemonist/lru-cache-with-delete |    Object    |       70,758,808 |       16,221,430 |                     129.74 |
|     1,000,000 |            tiny-lru             |    Object    |      118,609,334 |       64,071,956 |                     217.48 |
|     1,000,000 |            js-sieve             |     Map      |      183,397,439 |      125,376,004 |                     316.09 |
|     1,000,000 |            lru-cache            |     Map      |      103,364,415 |       45,342,980 |                     178.15 |
|     1,000,000 |  mnemonist/lru-map-with-delete  |     Map      |      103,326,676 |       45,305,241 |                     178.08 |
|     1,000,000 |       playground/lru-uint       |     Map      |      103,365,364 |       45,343,929 |                     178.15 |
|     1,000,000 |   playground/sieve-map-entry    |     Map      |      127,416,285 |       69,394,850 |                     219.60 |
|     1,000,000 |      playground/sieve-uint      |     Map      |      103,376,208 |       45,354,773 |                     178.17 |
|     1,000,000 |            zf/sieve             |     Map      |      175,430,400 |      117,408,965 |                     302.35 |

## Playground

The playground directory is for quickly trying out ideas or implementations. A few of my experiments can be found there for consideration.

## Related Work

https://github.com/dominictarr/bench-lru

## Contributing

Everyone interacting with this project is expected to follow the [code of conduct](CODE_OF_CONDUCT.md).

## License

Released under the [MIT License](LICENSE).
