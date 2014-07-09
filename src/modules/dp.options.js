/*
https://developers.google.com/drive/v2/reference/
 */

var DrivePass = DrivePass || {};

DrivePass.Options = (function() {

  var $appName = document.getElementById('appName'),
    $sheet_url = document.getElementById("sheet_url"),
    $status = document.getElementById("status"),
    $setAppName = document.getElementById('setAppName'),
    $save = document.getElementById('save'),
    $sheetJump = document.getElementById("goToSheet"),
    $makeSheet = document.getElementById('makeSheet'),
    $setSheetUrl = document.getElementById('setSheetUrl'),
    doReload = false;

  utils.toggler('inst_link', 'instructions');

  var app_name = localStorage.getItem('app_name');
  if (app_name === null) {
    $setAppName.classList.add('show');
    doReload = true;
  } else {
    $setSheetUrl.classList.remove('hidden');
    doReload = false;
  }

  // Saves options to localStorage
  function save_options() {
    if (doReload) {
      // just saving app_name and reloading extension to start the oAuth process
      var browser_name = $appName.value;
      localStorage.setItem("app_name", browser_name);
      $status.textContent = "Options Saved.";
      _.delay(chrome.runtime.reload, 500);
    } else {
      // saving new URL and reseting local copy of DB
      var sheet_url_val = $sheet_url.value;
      localStorage.setItem("sheet_url", sheet_url_val);
      DrivePass.Settings.gs_sheet_init.sheet_url = sheet_url_val;
      DrivePass.ResetLocal().init(function() {
        $status.textContent = "Options Saved.";
      });
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
});