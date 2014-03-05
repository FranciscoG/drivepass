/*
https://developers.google.com/drive/v2/reference/
 */

var DrivePass = DrivePass || {};

DrivePass.Options = (function() {

  var Sheet = new DrivePass.GoogleSpreadsheet(),
    $appName = document.getElementById('appName'),
    $sheet_url = document.getElementById("sheet_url"),
    $status = document.getElementById("status"),
    $setAppName = document.getElementById('setAppName'),
    $save = document.getElementById('save'),
    $sheetJump = document.getElementById("goToSheet"),
    $makeSheet = document.getElementById('makeSheet'),
    doReload = false;
    
    utils.toggler('inst_link','instructions');
    
    var app_name = localStorage.getItem('app_name');
    if (app_name === null) {
      $setAppName.classList.add('show');
      doReload = true;
    }

    // Saves options to localStorage
    function save_options() {
      var sheet_url_val = $sheet_url.value;
      var browser_name =  $appName.value;
      
      localStorage.setItem("sheet_url", sheet_url_val);
      localStorage.setItem("app_name", browser_name);
      
      DrivePass.Settings.gs_sheet_init.sheet_url = sheet_url_val;
      Sheet.init(DrivePass.Settings.gs_sheet_init);
      // load data into locatStorage upon saving
      DrivePass.Signal.listen('gs_data_loaded', function(topic,response_data){
        localStorage.setItem('_data', JSON.stringify(response_data));
      });
      Sheet.load();
      // Update status to let user know options were saved.
      $status.textContent = "Options Saved.";
      if (doReload) {
        _.delay(chrome.runtime.reload, 1000);
      }
    }

    // Populates the input box with the saved url if it exists
    function restore_options() {
      var curr_url = localStorage.getItem("sheet_url");
      var curr_appname = localStorage.getItem("app_name");
      $appName.value = curr_appname;

      if (curr_url === null || curr_url === "") {
        return false;
      } else {
        $sheet_url.value = curr_url;
        $save.textContent = "update";
        $sheetJump.href = curr_url;
        $sheetJump.style.display = "block";
      }
    }
    document.addEventListener('DOMContentLoaded', restore_options);
    $save.addEventListener('click', save_options);

    var gdrive = new DrivePass.GoogleDrive();
    
    $makeSheet.addEventListener('click', function(e){
      e.preventDefault();

    });

});