var DrivePass = DrivePass || {};

DrivePass.Sec = (function(sjcl) {

  var fullData = JSON.parse(localStorage.getItem('_full'));
  var _fullSheet = fullData.sheetData;
  var Sheet = DrivePass.Sheet;
  var megaPass = DrivePass.getMasterPass(); // request main password via popup action

  // take an existing spreadsheet db and encrypt it line by line
  var convert = function() {
    var entries = fullData.sheetData.feed.entry;

    for (var _e = 0; _e < entries.length; _e++) {
      update(entries[_e]);
    }

    // reset local copy when done
    DrivePass.ResetLocal().init();
  };

  var update = function(entry) {
    var _entry = entry || null;
    if (_entry === null) {
      return false;
    }
    // convert just name and password, leave site name
    var _site = _entry.gsx$site.$t;
    var old_login = _entry.gsx$username.$t;
    var old_pass = _entry.gsx$password.$t;

    var un = "";
    var pw = "";

    var data = [_site, un, pw];
    Sheet.update(_entry, data, function(result) {
      if (result.success === false) {
        //
      } else {
        //
      }
    });
  };

  return {
    convert: convert,
    update: update
  };

})(sjcl);