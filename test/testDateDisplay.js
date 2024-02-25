
var assert = require('assert');

var displayDate = function(dateString) {
   var prependZero = function(num) {
      return num < 10 ? ("0" + num) : num;
   };

   if(typeof dateString == "string") {
      var tgl = new Date(dateString);

      if(tgl != "Invalid Date") {
         return [
            prependZero(tgl.getDate()),
            prependZero((tgl.getMonth() + 1)),
            tgl.getFullYear()
         ].join("/") + " " +
         [
            prependZero(tgl.getHours()),
            prependZero(tgl.getMinutes())
         ].join(":");
      }
   }

   return "";
};

describe('Date Display', function() {
   describe('Tampilkan tanggal secara singkat dd MM YYYY H:i', function() {
      it('should return empty string when supplied with false format', function() {
         assert.equal("", displayDate("ahoy"));
      });

      it("should return correct format with padded zero of 2/5/2015 09:05", function() {
         assert.equal("02/05/2015 09:05", displayDate("02 May 2015 09:05"));
      })
   });
})
