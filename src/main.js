var DrivePass = DrivePass || {};

DrivePass.ext = new DrivePass.Router({

  universal : function(){
    DrivePass.Settings = JSON.parse(localStorage.getItem('options')) || {};
    DrivePass.Settings.keeplocal = DrivePass.Settings.keeplocal || true;
    DrivePass.Settings.route = document.body.dataset.route;
    DrivePass.Settings.gs_sheet_init = {
      sheet_url : localStorage.getItem('sheet_url'),
      columns : ['site','username','password']
    };
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
    new DrivePass.Options();
  }

});
