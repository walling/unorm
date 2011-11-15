#!/bin/sh
test -f index.js && rm index.js

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
echo '/***** Export as Common JS module *****/'       >> index.js
echo ''                                               >> index.js
echo '// The easy conversion functions are exported.' >> index.js
echo ''                                               >> index.js
echo 'exports.nfc  = UNorm.nfc;'                      >> index.js
echo 'exports.nfd  = UNorm.nfd;'                      >> index.js
echo 'exports.nfkc = UNorm.nfkc;'                     >> index.js
echo 'exports.nfkd = UNorm.nfkd;'                     >> index.js
