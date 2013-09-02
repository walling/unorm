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

/***** Export as shim for String::normalize method *****/

if (!String.prototype.normalize) {
	String.prototype.normalize = function(form) {
		var str = '' + this;
		form = '' + (form === undefined ? 'NFC' : form);

		if (form === 'NFC') {
			return root.nfc(str);
		} else if (form === 'NFD') {
			return root.nfd(str);
		} else if (form === 'NFKC') {
			return root.nfkc(str);
		} else if (form === 'NFKD') {
			return root.nfkd(str);
		} else {
			throw new RangeError('Invalid normalization form: ' + form);
		}
	};
}
