/* jshint node: true */
/* global describe:true, it:true */
"use strict";

var assert = require("assert");
var fs = require("fs");
var unorm = require("../lib/unorm.js");

var utdata = fs.readFileSync(__dirname + "/../data/NormalizationTest.txt").toString();
var tests = [];

utdata.split("\n").forEach(function (line, lineNumber) {
   line = line.replace(/#.*$/, "");
   if (line[0] === "@") {
      return; // title
   }

   // Columns (c1, c2,...) are separated by semicolons
   // They have the following meaning: source; NFC; NFD; NFKC; NFKD
   var parts = line.split(/\s*;\s*/);
   assert(parts.length === 1 || parts.length === 6, "There should be five columns, not " + parts.length + " -- line " + lineNumber);
   if (parts.length === 1)  {
      return;
   }
   parts.slice(0, 5);

   // split p
   parts = parts.map(function (p) {
      return p.split(/\s+/).map(function (x) {
         // should use fromCodePoint - part of ES6
         return parseInt(x, 16);
      });
   });

   parts.line = lineNumber + ": " + line;

   tests.push(parts);
});

function doTest(test){
   var raw = test.map(function (p) {
      return String.fromCharCode.apply(undefined, p);
   });

   var nfd = raw.map(unorm.nfd);
   var nfkd = raw.map(unorm.nfkd);
   var nfc = raw.map(unorm.nfc);
   var nfkc = raw.map(unorm.nfkc);

   //NFC
   assert.strictEqual(nfc[0], raw[1], test.line + ": c2 == NFC(c1)");
   assert.strictEqual(nfc[1], raw[1], test.line + ": c2 == NFC(c2)");
   assert.strictEqual(nfc[2], raw[1], test.line + ": c2 == NFC(c3)");
   assert.strictEqual(nfc[3], raw[3], test.line + ": c4 == NFC(c4)");
   assert.strictEqual(nfc[4], raw[3], test.line + ": c4 == NFC(c5)");
   //NFD
   assert.strictEqual(nfd[0], raw[2], test.line + ": c3 == NFD(c1)");
   assert.strictEqual(nfd[1], raw[2], test.line + ": c3 == NFD(c2)");
   assert.strictEqual(nfd[2], raw[2], test.line + ": c3 == NFD(c3)");
   assert.strictEqual(nfd[3], raw[4], test.line + ": c5 == NFD(c4)");
   assert.strictEqual(nfd[4], raw[4], test.line + ": c5 == NFD(c5)");
   //NFKC
   assert.strictEqual(nfkc[0], raw[3], test.line + ": c5 == NFKC(c1)");
   assert.strictEqual(nfkc[1], raw[3], test.line + ": c5 == NFKC(c2)");
   assert.strictEqual(nfkc[2], raw[3], test.line + ": c5 == NFKC(c3)");
   assert.strictEqual(nfkc[3], raw[3], test.line + ": c5 == NFKC(c4)");
   assert.strictEqual(nfkc[4], raw[3], test.line + ": c5 == NFKC(c5)");
   //NFKD
   assert.strictEqual(nfkd[0], raw[4], test.line + ": c5 == NFKD(c1)");
   assert.strictEqual(nfkd[1], raw[4], test.line + ": c5 == NFKD(c2)");
   assert.strictEqual(nfkd[2], raw[4], test.line + ": c5 == NFKD(c3)");
   assert.strictEqual(nfkd[3], raw[4], test.line + ": c5 == NFKD(c4)");
   assert.strictEqual(nfkd[4], raw[4], test.line + ": c5 == NFKD(c5)");
}

describe("normalization " + tests.lineNumbergth + " tests", function () {
   var bucketSize = 100;
   var m = Math.ceil(tests.length / bucketSize);
   for (var i = 0; i < m; i++) {
      var start = i * bucketSize;
      var end = Math.min(tests.length, (i+1) * bucketSize);

      /* jshint -W083 */
      it((start+1) + " - " + end, function () {
         for (var j = start; j < end; j++) {
            doTest(tests[j]);
         }
      });
      /* jshint +W083 */
   }
});

describe("anti-tests", function () {
   it("should fail", function () {
      // deep-copy test
      assert.throws(function () {
         var test = tests[0].map(function (x) { return x.slice(); });
         test[0][0] += 1;

         doTest(test);
      });
   });
});
