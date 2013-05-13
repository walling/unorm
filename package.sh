#!/bin/sh
test -f index.js && rm index.js

echo '/*globals exports:true,window:true*/'           >> index.js
echo '(function() {'                                  >> index.js
echo ''                                               >> index.js
echo '/***** unorm.js *****/'                         >> index.js
echo ''                                               >> index.js
cat src/unorm.js | sed -e 's/^})();$/}).call(this);/' >> index.js
echo 'var UNorm = this.UNorm; // Small hack :-)'      >> index.js
echo ''                                               >> index.js
echo '/***** unormdata.js *****/'                     >> index.js
echo ''                                               >> index.js
cat src/unormdata.js                                  >> index.js
echo ''                                               >> index.js
cat export.js                                         >> index.js
echo ''                                               >> index.js
echo '}());'                                          >> index.js
