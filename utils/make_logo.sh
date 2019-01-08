#!/bin/bash

SZ_X=$1
SZ_Y=$2

DIMENTIONS=${SZ_X}x${SZ_Y}
OUTFILE=logo${SZ_X}.png

convert -resize $DIMENTIONS -gravity center -extent $DIMENTIONS -background transparent logo.svg ${OUTFILE} 

echo ${OUTFILE}
