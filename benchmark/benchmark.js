/*jshint node:true*/
"use strict";

var fs = require("fs");
var Benchmark = require("benchmark");

var head = require("../lib/unorm.js");
var release = require("unorm");
var releaseVersion = require("unorm/package").version;

var kalevalaEnglish = fs.readFileSync(__dirname + "/pg5186.txt").toString().substr(0, 100000);
var kalevalaFinnish = fs.readFileSync(__dirname + "/pg7000.txt").toString().substr(0, 100000);

function benchmarkFunction(name, f) {
  var suite = new Benchmark.Suite();

  // add tests
  suite
  .add(name + ": HEAD.........", function () {
    f(head);
  })
  .add(name + ": release " + releaseVersion, function() {
    f(release);
  });

  suite
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").pluck("name"));
  });

  suite.run();
}

function runBenchmarks(name, content) {
  var nfc = head.nfc(content);
  var nfd = head.nfd(content);

  benchmarkFunction(name + ": nfc -> nfc", function (unorm) {
    unorm.nfc(nfc);
  });

  benchmarkFunction(name + ": nfc -> nfd", function (unorm) {
    unorm.nfd(nfc);
  });

  benchmarkFunction(name + ": nfd -> nfc", function (unorm) {
    unorm.nfc(nfd);
  });

  benchmarkFunction(name + ": nfd -> nfd", function (unorm) {
    unorm.nfd(nfd);
  });
}

runBenchmarks("kalevala finnish", kalevalaFinnish);
runBenchmarks("kalevala english", kalevalaEnglish);
