#!/bin/bash
cur=`git describe --abbrev=0 --tags`
prev=`git describe --abbrev=0 ${cur}^`

git log --oneline --no-merges ${prev}..${cur} --pretty="format:%s %b"