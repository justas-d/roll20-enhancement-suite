#!/bin/bash
cur=`git describe --abbrev=0 --tags`
prev=`git describe --abbrev=0 ${cur}^`

echo "Generating changelog for commits in range ${prev} -> ${cur}"

git log --oneline --no-merges ${prev}..${cur} > changelog.txt

cat changelog.txt

echo "Done."
