/***** Export as Common JS module *****/

var root = typeof(exports) === 'object' ? exports : {};

if (typeof(window) === 'object') {
	window.unorm = root;
}

// The easy conversion functions are exported.
root.nfc  = UNorm.nfc;
root.nfd  = UNorm.nfd;
root.nfkc = UNorm.nfkc;
root.nfkd = UNorm.nfkd;
