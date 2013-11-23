(function(){

  var issetParam = function(a){
    return (void 0===a || null===a) ? false : true;
  };

  var accessSheet = (function() {

    var Sheet = new GoogleSpreadsheet();

    var sendPW = function(pw){
      chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {password: pw}, function(response) {
          console.log(response.dom);
        });
      });
    };

    var findPW = function(data,tabDomain) {
      if (issetParam(data) && typeof data === 'object') {
        for (prop in data) {
          if (tabDomain.indexOf(data[prop].site) !== -1) {
            var result = [];
            result.push(data[prop].u,data[prop].pw);
            return result;
          }
        }
      } else {
        console.warn('findPW: data not an object');
      }
    };
    var getDomain = function(tabUrl){
      if (issetParam(tabUrl)) {
        var tabDomain,
            finalDomain;
        if (/http:/i.test(tabUrl)) {
          tabDomain = tabUrl.split('http://');
          finalDomain = tabDomain[1].split('/');
        } else if (/https/i.test(tabUrl)) {
          tabDomain = tabUrl.split('https://');
          finalDomain = tabDomain[1].split('/');
        } else {
          finalDomain = tabDomain.split('/');
        }
        return finalDomain[0];
      } else {
        console.warn('getDomain: url is null');
      }
    };

    var handleStatus = function(status,message) {
      var stat = status || '';
      var msg = message || '';
      var statusElem = document.getElementById('status');
      if (stat !== '' && msg !== '') {
        statusElem.textContent = msg;
        statusElem.className = stat;
        statusElem.style.display = "block";
      }
    };

    var updateUI = function(result){
      if (issetParam(result)){
        document.getElementById('un').textContent = result[0];
        document.getElementById('pw').textContent = result[1];
        sendPW(result[1]);
      } else {
        console.warn('updateUI: results are null');
      }
    };

    var bindAdd = function(){
      document.getElementById('add').addEventListener('click', function(evt) {
        Sheet.add();
        var status = getResults();
        if (status.success === false){
          handleStatus('error',status.message);
        } else {
          handleStatus('success', status.message);
        }
      },false);
    };

    var getResults = function(){
      return JSON.parse(localStorage['result']);
    };

    var init = function() {
      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function(tabs) {
        var tab = tabs[0];
        var activeUrl = getDomain(tab.url);
        Sheet.init({
          sheet_url : localStorage['sheet_url'],
          tab_url : activeUrl
        }).load();
        var status = getResults();
        var found = findPW(status.sheetData,activeUrl);
        if (typeof found === 'undefined') {
          handleStatus('error','password not found');
        } else {
          updateUI(found);
        }
      });
      bindAdd();
    };

    return {
      init: init
    };
  });

  var access = new accessSheet();
  
  document.addEventListener('DOMContentLoaded', function(e) {
    if (this.bDone) {
      return;
    }
    this.bDone = true;
    access.init();
  });

})();


