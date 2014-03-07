var DrivePass = DrivePass || {};

DrivePass.ResetLocal = (function() {
  
  var Sheet = new DrivePass.GoogleSpreadsheet();
  Sheet.init(DrivePass.Settings.gs_sheet_init);

  var init = function(cb){
    Sheet.load(function(response_data){
      localStorage.setItem('_full', JSON.stringify(response_data));
      if (response_data.success === true) {
        var filteredData = DrivePass.Password.filterResults(response_data.sheetData);
        localStorage.setItem('_data', JSON.stringify(filteredData));
        if (typeof cb === "function") {
          cb();
        }
      }
    });
  };

  return {
    init : init
  };

});