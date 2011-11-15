#!/bin/sh
test -d src/ && rm -r src/
svn export http://svn.coderepos.org/share/lang/javascript/UnicodeNormalizer/ src/
