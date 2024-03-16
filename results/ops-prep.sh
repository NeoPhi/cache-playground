rm -f ops-1.ldjson
grep -v broadcast ops-2-results.ldjson | grep -v "playground/lru-uint" | grep -v "playground/sieve-uint" > ops-2.ldjson
grep -v "playground/sieve-uint" ops-3-results.ldjson > ops-3.ldjson
cp ops-4-results.ldjson ops-4.ldjson
cat ops-?.ldjson > ../ops.ldjson
sed -e 's/.*cacheName":"//' -e 's/".*//' ../ops.ldjson | sort | uniq -c
