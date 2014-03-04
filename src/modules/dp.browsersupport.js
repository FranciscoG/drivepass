/* 
 * This is the funnel for all browser related interactions
 * right now it only handles Chrome, in the futre it will also handle FireFox, maybe Safari too
*/

var DrivePass = DrivePass || {};

DrivePass.Browser = {

  isChrome : function(){
    return /Chrome/.test(navigator.userAgent);
  },
  
  ChromeExt: function(){
    if (this.isChrome()){
      if (!chrome.runtime) {
        // Chrome 20-21
        chrome.runtime = chrome.extension;
      } else if(!chrome.runtime.onMessage) {
        // Chrome 22-25
        chrome.runtime.onMessage = chrome.extension.onMessage;
        chrome.runtime.sendMessage = chrome.extension.sendMessage;
        chrome.runtime.onConnect = chrome.extension.onConnect;
        chrome.runtime.connect = chrome.extension.connect;
      }
    }
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

  oAuthSendRequest : function(listUrl, callback, params) {

    if (this.isChrome()) {
      this.ChromeExt();
      chrome.runtime.getBackgroundPage(function(w){
        w.oauth.sendSignedRequest(listUrl, callback, params);
      });
    }
  }

};

