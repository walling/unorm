/* jshint node: true */
/* global describe:true, it:true */

var assert = require("assert");

// require for shim
require("../lib/unorm.js");

describe("es6-shim", function () {
	it("length property of the normalize method is 0.", function () {
		assert("foo".normalize.length, 0, "length property of the normalize method is 0.");
	});

	it("If f is not one of \"NFC\", \"NFD\", \"NFKC\", or \"NFKD\", then throw a RangeError Exception.", function () {
		try {
			"foo".normalize("NFF");
		} catch (e) {
			assert(e instanceof RangeError);
			return;
		}
		assert(false, "Should throw");
	});

	it("works", function () {
        var str = "äiti";
        assert.equal("\u00e4\u0069\u0074\u0069", str.normalize());
        assert.equal("\u00e4\u0069\u0074\u0069", str.normalize("NFC"));
        assert.equal("\u0061\u0308\u0069\u0074\u0069", str.normalize("NFD"));
        assert.equal("\u00e4\u0069\u0074\u0069", str.normalize("NFKC"));
        assert.equal("\u0061\u0308\u0069\u0074\u0069", str.normalize("NFKD"));
	});
});