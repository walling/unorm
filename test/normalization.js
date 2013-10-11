/* jshint node: true */
/* global describe:true, it:true */
"use strict";

var assert = require("assert");
var fs = require("fs");
var unorm = require("../lib/unorm.js");

var testpattern = /^([^@#;]*);([^;]*);([^;]*);([^;]*);([^;]*);/mg;
var utdata = fs.readFileSync(__dirname + "/NormalizationTest.txt").toString();

var matches = utdata.match(testpattern);
var testCntMax = matches.length;

function getTestString(line){
   var ret = [];
   var s;
   var splitpattern = /[0-9a-fA-F]+/g;

   for (var i = 0; i < line.length; ++i){
      s = "";
      var match;
      while ((match = splitpattern.exec(line[i])) !== null) {
         /* jshint evil: true */
         s += UNorm.UChar.fromCharCode(eval("0x" + match[0])).toString();
         /* jshint evil: false */
      }
      ret.push(s);
   }
   return ret;
}

function doTest(i){
   testpattern.lastIndex = 0;
   var match = testpattern.exec(matches[i]);
   assert.notEqual(null, match);

   var raw = getTestString(match);
   var nfd = raw.map(function(i){
      return unorm.nfd(i);
   });
   var nfkd = raw.map(function(i){
      return unorm.nfkd(i);
   });
   var nfc = raw.map(function(i){
      return unorm.nfc(i);
   });
   var nfkc = raw.map(function(i){
      return unorm.nfkc(i);
   });

   //NFD
   assert.equal(raw[3], nfd[1], "c3 == NFD(c1)");
   assert.equal(raw[3], nfd[2], "c3 == NFD(c2)");
   assert.equal(raw[3], nfd[3], "c3 == NFD(c3)");
   assert.equal(raw[5], nfd[4], "c5 == NFD(c4)");
   assert.equal(raw[5], nfd[5], "c5 == NFD(c5)");
   //NFKD
   assert.equal(raw[5], nfkd[1], "c5 == NFKD(c1)");
   assert.equal(raw[5], nfkd[2], "c5 == NFKD(c2)");
   assert.equal(raw[5], nfkd[3], "c5 == NFKD(c3)");
   assert.equal(raw[5], nfkd[4], "c5 == NFKD(c4)");
   assert.equal(raw[5], nfkd[5], "c5 == NFKD(c5)");
   //NFC
   assert.equal(raw[2], nfc[1], "c2 == NFC(c1)");
   assert.equal(raw[2], nfc[2], "c2 == NFC(c2)");
   assert.equal(raw[2], nfc[3], "c2 == NFC(c3)");
   assert.equal(raw[4], nfc[4], "c4 == NFC(c4)");
   assert.equal(raw[4], nfc[5], "c4 == NFC(c5)");
   //NFKC
   assert.equal(raw[4], nfkc[1], "c5 == NFKC(c1)");
   assert.equal(raw[4], nfkc[2], "c5 == NFKC(c2)");
   assert.equal(raw[4], nfkc[3], "c5 == NFKC(c3)");
   assert.equal(raw[4], nfkc[4], "c5 == NFKC(c4)");
   assert.equal(raw[4], nfkc[5], "c5 == NFKC(c5)");
}

describe("normalization tests", function () {
   var bucketSize = 100;
   var m = Math.ceil(testCntMax / bucketSize);
   for (var i = 0; i < m; i++) {
      var start = i * bucketSize;
      var end = Math.min(testCntMax, (i+1) * bucketSize);

      /* jshint -W083 */
      it(start + " - " + (end-1), function () {
         for (var j = start; j < end; j++) {
            doTest(j);
         }
      });
      /* jshint +W083 */
   }
});