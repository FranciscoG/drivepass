var DrivePass = DrivePass || {};

DrivePass.ext = new DrivePass.Router({

  universal : function(){
    DrivePass.Settings = JSON.parse(localStorage.getItem('options')) || {};
    // setting some defaults if not chosen
    DrivePass.Settings.keeplocal = DrivePass.Settings.keeplocal || true;
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
    var Sheet = new DrivePass.GoogleSpreadsheet();
    utils.toggler('inst_link','instructions');
    // Saves options to localStorage.cc
    function save_options() {
      var sheet_url_val = document.getElementById("sheet_url").value;
      localStorage.setItem("sheet_url", sheet_url_val);
      Sheet.init({
        sheet_url : sheet_url_val,
        columns : ['site','username','password']
      });
      // load data into locatStorage upon saving
      DrivePass.Signal.listen('gs_data_loaded', function(topic,response_data){
        localStorage.setItem('_data', JSON.stringify(response_data));
      });
      Sheet.load();
      // Update status to let user know options were saved.
      document.getElementById("status").textContent = "Options Saved.";
    }

    // Populates the input box with the saved url if it exists
    function restore_options() {
      var curr_url = localStorage.getItem("sheet_url");
      if (curr_url === null || curr_url === "") {
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
