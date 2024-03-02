#!/bin/bash

export CODE_DIR=/home/danielr/Source/GitHub/NeoPhi/cache-playground
export DATA_DIR=/home/danielr/Source/GitHub/NeoPhi/cache-playground/datasets/twemcacheWorkload/txt
export OPS_OUTPUT=json

run_workload () {
  echo "$OPS_WORKLOAD $CACHE_NAME $CACHE_SIZE"
  zstd -cd $DATA_DIR/$OPS_WORKLOAD | node $CODE_DIR/dist/src/ops.js >> $CODE_DIR/runs.log
}

run_caches () {
  export CACHE_NAME=lru-cache
  run_workload
  export CACHE_NAME=playground/sieve-map-entry
  run_workload
  export CACHE_NAME=mnemonist/lru-map-with-delete
  run_workload
}

run_multiple () {
  export CACHE_SIZE=$1
  count=10
  for i in $(seq $count); do
    run_caches
  done
}

export OPS_WORKLOAD=alibabaBlock.sample100.txt.zst
run_multiple 89100
run_multiple 891000
run_multiple 2227499

export OPS_WORKLOAD=metaCDN.sample10.txt.zst
run_multiple 12238
run_multiple 122379
run_multiple 305948

export OPS_WORKLOAD=metaCDN.txt.zst
run_multiple 122451
run_multiple 1224513
run_multiple 3061282

export OPS_WORKLOAD=metaKV.sample10.txt.zst
run_multiple 51975
run_multiple 519750
run_multiple 1299374

export OPS_WORKLOAD=metaKV.sample100.txt.zst
run_multiple 5201
run_multiple 52007
run_multiple 130017

export OPS_WORKLOAD=tencentBlock.sample100.txt.zst
run_multiple 52587
run_multiple 525866
run_multiple 1314666

export OPS_WORKLOAD=twiter_cluster52.sample100.txt.zst
run_multiple 25115
run_multiple 251155
run_multiple 627887
