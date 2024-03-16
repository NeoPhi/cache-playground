grep -v uint memory-1-results.ldjson > memory-1.ldjson
grep -v sieve-uint memory-2-results.ldjson > memory-2.ldjson
cp memory-3-results.ldjson memory-3.ldjson
cat memory-?.ldjson > ../memory.ldjson
sed -e 's/.*cacheName":"//' -e 's/".*//' ../memory.ldjson | sort | uniq -c
