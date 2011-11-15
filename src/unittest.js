var utdata;
var testpattern=/^([^@#;]*);([^;]*);([^;]*);([^;]*);([^;]*);/mg;

var match;
var nfd, nfkd;
var testCntMax;
var testCnt;
var testUnitMax = 5;
var testUnit;
var timer;
function testTrigger(){
   $.get("data/NormalizationTest.txt", function(data){
         utdata = data;
         testpattern.lastIndex = 0;
         testCntMax = data.match(testpattern).length;
         testCnt = 0;
         testUnit = 0;
         timer = new Date().getTime();
         testpattern.lastIndex = 0;
         doTest();
         });
}
function trigger(str){
   utdata = str;
   testCntMax = 1;
   testCnt = 0;
   timer = new Date().getTime();
   testpattern.lastIndex = 0;
   doTest();
}
function doTest(match){
   if((match = testpattern.exec(utdata)) == null) {
      log((new Date().getTime() - timer) + "ms"); 
      return;
   }
   var raw = getTestString(match);
   var nfd = jQuery.map(raw, function(i){
      return UNorm.normalize("NFD", i);
   });
   var nfkd = jQuery.map(raw, function(i){
      return UNorm.normalize("NFKD", i);
   });
   var nfc = jQuery.map(raw, function(i){
      return UNorm.normalize("NFC", i);
   });
   var nfkc = jQuery.map(raw, function(i){
      return UNorm.normalize("NFKC", i);
   });
   try{
      //NFD
      assert(raw[3], nfd[1], "c3 == NFD(c1)");
      assert(raw[3], nfd[2], "c3 == NFD(c2)");
      assert(raw[3], nfd[3], "c3 == NFD(c3)");
      assert(raw[5], nfd[4], "c5 == NFD(c4)");
      assert(raw[5], nfd[5], "c5 == NFD(c5)");
      //NFKD
      assert(raw[5], nfkd[1], "c5 == NFKD(c1)");
      assert(raw[5], nfkd[2], "c5 == NFKD(c2)");
      assert(raw[5], nfkd[3], "c5 == NFKD(c3)");
      assert(raw[5], nfkd[4], "c5 == NFKD(c4)");
      assert(raw[5], nfkd[5], "c5 == NFKD(c5)");
      //NFC
      assert(raw[2], nfc[1], "c2 == NFC(c1)");
      assert(raw[2], nfc[2], "c2 == NFC(c2)");
      assert(raw[2], nfc[3], "c2 == NFC(c3)");
      assert(raw[4], nfc[4], "c4 == NFC(c4)");
      assert(raw[4], nfc[5], "c4 == NFC(c5)");
      //NFKC
      assert(raw[4], nfkc[1], "c5 == NFKC(c1)");
      assert(raw[4], nfkc[2], "c5 == NFKC(c2)");
      assert(raw[4], nfkc[3], "c5 == NFKC(c3)");
      assert(raw[4], nfkc[4], "c5 == NFKC(c4)");
      assert(raw[4], nfkc[5], "c5 == NFKC(c5)");
   } catch(e){
      log(match[0] + ":" + e.toString());
   }
   if(++testCnt % 100 == 0){
      log(testCnt + "/" + testCntMax);
   }
   if(++testUnit % testUnitMax == 0){
      setTimeout(doTest, 0);
   } else {
      doTest();
   }
};

function log(s){
   $("#test_result")[0].innerHTML += s + "<br>";
}
function assert(l, r, msg){
   function toReadable(s){
      var ret = [];
      for(var i = 0; i < s.length; ++i){
         ret.push(s.charCodeAt(i));
      }
      return ret.join(" ");
   }
   if(l != r){
      throw (msg + "(" + toReadable(l) + " vs " + toReadable(r) + ")");
   }
}
function getTestString(line){
   var ret = [];
   var s;
   var splitpattern = /[0-9a-fA-F]+/g;
   for(var i = 0; i < line.length; ++i){
      s = "";
      var match;
      while ((match = splitpattern.exec(line[i])) != null) {
         s += UNorm.UChar.fromCharCode(eval("0x" + match[0])).toString();
      }
      ret.push(s);
   }
   return ret;
}

