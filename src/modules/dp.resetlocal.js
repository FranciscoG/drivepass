var DrivePass = DrivePass || {};

DrivePass.ResetLocal = (function() {

  var Sheet = DrivePass.Sheet;

  var init = function(cb) {
    Sheet.load(function(response_data) {

      // save full response in localStorage
      localStorage.setItem('_full', JSON.stringify(response_data));

      if (response_data.success === true) {

        // remove persisted copy of taffy db if exists
        if (typeof localStorage.taffy_tdb !== 'undefined') {
          localStorage.removeItem('taffy_tdb');
        }
        // store new copy of Taffy DB
        var _db = DrivePass.Filters.createDBarray(response_data.sheetData);
        DrivePass.DB = TAFFY(_db);
        DrivePass.DB.store('tdb');

        // run any callback function if it exists
        if (typeof cb === "function") {
          cb();
        }

      }
    });
  };

  return {
    init: init
  };

});