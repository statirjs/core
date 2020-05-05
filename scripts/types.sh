#!/bin/sh

[ -e index.d.ts ] && rm index.d.ts

COUNT=0

while IFS= read line; do
  echo "${line}" >> 'index.d.ts'
done < ./types/types.d.ts

while IFS= read line; do
  COUNT=$(( $COUNT + 1 ))

  if [[ $COUNT != 1 ]]; then
    echo "${line}" >> 'index.d.ts'
  fi
done < ./types/core.d.ts
