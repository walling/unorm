/* jshint node: true */
/* global describe:true, it:true */
"use strict";

var assert = require("assert");
var unorm = require("../lib/unorm.js");

describe("simple examples", function () {
    it("äiti", function () {
        var str = "äiti";
        assert.equal("\u00e4\u0069\u0074\u0069", unorm.nfc(str));
        assert.equal("\u0061\u0308\u0069\u0074\u0069", unorm.nfd(str));
        assert.equal("\u00e4\u0069\u0074\u0069", unorm.nfkc(str));
        assert.equal("\u0061\u0308\u0069\u0074\u0069", unorm.nfkd(str));
    });
});
