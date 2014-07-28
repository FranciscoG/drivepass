var DrivePass = DrivePass || {};

DrivePass.Sec = (function(sjcl) {

  var fullData = JSON.parse(localStorage.getItem('_full'));
  var _fullSheet = fullData.sheetData;
  var entries = fullData.sheetData.feed.entry;

  var Sheet = DrivePass.Sheet;
  var megaPass = DrivePass.getMasterPass(); // request main password via popup action

  var __i = 0;

  // take an existing spreadsheet db and encrypt it line by line
  var convert = function(n) {
    if (typeof n !== "number") {
      return;
    }
    updateAll(entries[n]);
  };

  var updateAll = function(entry) {
    var _entry = entry || null;
    if (_entry === null) {
      return false;
    }
    // convert just name and password, leave site name
    var old_site = _entry.gsx$site.$t;
    var old_login = _entry.gsx$username.$t;
    var old_pass = _entry.gsx$password.$t;

    var _site = sjcl.encrypt(megaPass, old_site);
    var un = sjcl.encrypt(megaPass, old_login);
    var pw = sjcl.encrypt(megaPass, old_pass);

    var data = [_site, un, pw];
    Sheet.update(_entry, data, function(result) {
      if (result.success) {
        __i++;
        if (__i < entries.length) {
          convert(__i);
        }
      } else {
        console.error('error saving row for: ' + old_site);
      }
    });
  };

  return {
    convert: convert
  };

})(sjcl);