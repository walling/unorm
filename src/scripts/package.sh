#!/bin/bash

cd "`dirname "$0"`/../.."

echo '/*globals exports:true,window:true*/'            > lib/unorm.js
echo '(function() {'                                  >> lib/unorm.js
echo ''                                               >> lib/unorm.js
echo '/***** unorm.js *****/'                         >> lib/unorm.js
echo ''                                               >> lib/unorm.js
cat src/unorm.js | sed -e 's/^})();$/}).call(this);/' >> lib/unorm.js
echo 'var UNorm = this.UNorm; // Small hack :-)'      >> lib/unorm.js
echo ''                                               >> lib/unorm.js
echo '/***** unormdata.js *****/'                     >> lib/unorm.js
echo ''                                               >> lib/unorm.js
cat src/unormdata.js                                  >> lib/unorm.js
echo ''                                               >> lib/unorm.js
cat src/export.js                                     >> lib/unorm.js
echo ''                                               >> lib/unorm.js
echo '}());'                                          >> lib/unorm.js
