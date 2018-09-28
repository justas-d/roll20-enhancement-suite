#!/bin/bash
cur=`git describe --abbrev=0 --tags`

git log --oneline --no-merges ${cur}..HEAD --pretty="format:%s %b"