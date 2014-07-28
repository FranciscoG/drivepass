var DrivePass = DrivePass || {};

DrivePass.ext = new DrivePass.Router({

  universal: function() {
    DrivePass.Settings = JSON.parse(localStorage.getItem('options')) || {};
    DrivePass.Settings.route = document.body.dataset.route;

    DrivePass.Settings.gs_sheet_init = {
      sheet_url: localStorage.getItem('sheet_url') || "",
      columns: ['site', 'username', 'password']
    };

    if (DrivePass.Settings.gs_sheet_init.sheet_url !== "") {
      DrivePass.Sheet = new DrivePass.GoogleSpreadsheet();
      DrivePass.Sheet.init(DrivePass.Settings.gs_sheet_init);
    }

    if (typeof localStorage.taffy_tdb !== 'undefined') {
      DrivePass.DB = TAFFY().store('tdb');
    } else if (typeof localStorage._full !== 'undefined') {
      var _db = localStorage.getItem('_full');
      _db = DrivePass.Filters.createDBarray(JSON.parse(_db).sheetData);
      DrivePass.DB = TAFFY(_db);
    } else {
      DrivePass.ResetLocal().init();
    }
  }

});