var DrivePass = DrivePass || {};

DrivePass.Sec = (function(sjcl) {

  var fullData = JSON.parse(localStorage.getItem('_full'));
  var Sheet = DrivePass.Sheet;

  sjcl.random.startCollectors();

  var _salt = sjcl.random.randomWords(2, 0);

  var params = {
    adata: "",
    iter: 1000,
    salt: _salt,
    mode: "ccm",
    ts: 64,
    ks: 256
  };

  var hash = function(password) {
    var p = sjcl.misc.cachedPbkdf2(password, params);
    var x = p.key.slice(0, params.ks / 32);
    return sjcl.codec.hex.fromBits(x);
  };

  // take an existing spreadsheet db and encrypt it line by line
  var convert = function() {
    // grab full list
    // loop through
    // convert just name and password, leave site name
    // update entry

    // reset local copy when done
    DrivePass.ResetLocal().init();
  };

  var update = function(entry) {
    var _entry = entry || null;
    if (_entry === null) {
      return false;
    }
    var _site = "";
    var un = ""; // encrypt here
    var pw = ""; // also encrypt
    var data = [_site, un, pw];
    Sheet.update(entry, data, function(result) {
      if (result.success === false) {
        //
      } else {
        //
      }
    });
  };


  return {
    hash: hash,
    convert: convert
  };

})(sjcl);