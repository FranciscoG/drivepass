/* 
 * 
*/

var DrivePass = DrivePass || {};

DrivePass.Browser = {

  isChrome : function(){
    return /Chrome/.test(navigator.userAgent);
  },
  
  isFirefox : function(){
    return /Firefox/.test(navigator.userAgent);
  },

  sendToPage : function(data) {
    var _data = data || {};

    // data should always have username and password, otherwise return.
    if ( Object.keys(_data).length !== 2) {
      return false;
    }

    if (this.isChrome()) {

      chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          password: _data.password,
          username: _data.username
        }, function(response) {
            console.log(response.dom);
        });
      });

    }

  },

  getActiveTab : function(callback) {

    if (this.isChrome()) {

      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function(tabs) {
        var tab = tabs[0];
        this.activeTabUrl = utils.getHostname(tab.url);
        
        if (typeof callback === 'function') {
          callback();
        }

      }.bind(this));
    }
  
  },

  handleOauth : function() {

  }

};

