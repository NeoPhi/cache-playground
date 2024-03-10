#!/bin/bash

export CODE_DIR=/home/danielr/Source/GitHub/NeoPhi/cache-playground
export MEM_OUTPUT=json

run_workload () {
  export CACHE_NAME=$1
  echo "$CACHE_NAME $CACHE_SIZE"
  node --expose-gc $CODE_DIR/dist/src/memory.js >> $CODE_DIR/memory.ldjson
}

run_caches () {
  run_workload map
  run_workload object
  run_workload js-sieve
  run_workload tiny-lru
  run_workload lru-cache
  run_workload playground/sieve-map-entry
  run_workload mnemonist/lru-map-with-delete
  run_workload playground/lru-uint
  run_workload playground/sieve-uint
  run_workload zf/sieve
  run_workload mnemonist/lru-cache-with-delete
}

run_multiple () {
  export CACHE_SIZE=$1
  count=10
  for i in $(seq $count); do
    run_caches
  done
}

run_multiple 1000
run_multiple 10000
run_multiple 100000
run_multiple 1000000
