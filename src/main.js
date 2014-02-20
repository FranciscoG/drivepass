var DrivePass = DrivePass || {};

DrivePass.ext = new DrivePass.Router({

  universal : function(){
    DrivePass.Settings = JSON.parse(localStorage.getItem('options')) || {};
    DrivePass.Settings.route = document.body.dataset.route;
  },

  popup : function() {
    var initUI = function(){
      utils.toggler('showGPoptions','gpOptions');
      utils.toggler('showInfo','theInfo');
      utils.toggler('show_symbols','hidden_symbols');
    };

    var popup = new DrivePass.Popup();
    var generate = new DrivePass.Generator();
    
    document.addEventListener('DOMContentLoaded', function(e) {
      if (this.bDone) {
        return; // deal with DOMContentLoaded being fired twice for some reason
      }
      this.bDone = true;
      generate.init();
      popup.init();
      initUI();
    });
  },

  chrome_options : function() {
    /*
    TODO:  
    - add option whether to store db locally or not, read that option in googlespreadsheet module
    - store new option pref in localStorage
    - add ability to clear out local cache
    - when turning off option (setting it to false), clear out localStorage sheet data
    - if sheet_url not set, add/show a link to "drive.google.com"
    - UI updates all around
    */
   
    // Saves options to localStorage.
    function save_options() {
      localStorage.setItem("sheet_url", document.getElementById("sheet_url").value);
      // Update status to let user know options were saved.
      document.getElementById("status").textContent = "Options Saved.";
    }

    // Populates the input box with the saved url if it exists
    function restore_options() {
      var curr_url = localStorage.getItem("sheet_url");
      if (!curr_url || curr_url === "") {
        return false;
      } else {
        document.getElementById("sheet_url").value = curr_url;
        document.getElementById("save").textContent = "update";
        var sheetJump = document.getElementById("goToSheet");
        sheetJump.href = curr_url;
        sheetJump.style.display = "block";
      }
    }
    document.addEventListener('DOMContentLoaded', restore_options);
    document.getElementById('save').addEventListener('click', save_options);
  }

});
