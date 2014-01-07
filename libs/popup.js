(function(){

  var issetParam = function(a){
    return (void 0===a || null===a) ? false : true;
  };

  var toggler = function(handler,targ) {
    var elm = document.getElementById(targ);
    document.getElementById(handler).addEventListener('click',function(e){
      if (elm.classList.contains("show")) {
        elm.classList.remove('show');
      } else {
        elm.classList.add('show');
      }
    },false);
  };

  var initUI = function(){
    toggler('showGPoptions','gpOptions');
    toggler('showInfo','theInfo');
  };
  
  var accessSheet = (function() {

    var Sheet = new GoogleSpreadsheet();

    var sendDetails = function(un,pw){
      chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {password: pw,username: un}, function(response) {
          console.log(response.dom);
        });
      });
    };

    var findPW = function(data,tabDomain) {
      var data = data || {};
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
      // inspired by: http://stackoverflow.com/a/12470263
      var tUrl = tabUrl || "",
          a = document.createElement('a');
      if (tUrl !== ""){
        a.href = tUrl;
        return a['hostname'];
      } else {
        console.warn('tab url undefined');
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
        sendDetails(result[0],result[1]);
      } else {
        console.warn('updateUI: results are null');
      }
    };

    var bindAdd = function(){
      document.getElementById('add').addEventListener('click', function(evt) {
        Sheet.add();
        var a = setTimeout(function(){
          var status = getResults();
          if (status.success === false){
            handleStatus('error',status.message);
          } else {
            handleStatus('success', status.message);
          }
        },1000);
      },false);
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
        }).load(function(result){
          var found = findPW(result.sheetData,activeUrl);
          if (typeof found === 'undefined') {
            handleStatus('error','password not found');
          } else {
            updateUI(found);
          }
        });
      });
      bindAdd();
    };

    return {
      init: init
    };
  });

  var access = new accessSheet();
  var generate = new Generator();
  
  document.addEventListener('DOMContentLoaded', function(e) {
    if (this.bDone) {
      return; // deal with this being fired twice
    }
    this.bDone = true;
    generate.init();
    access.init();
    initUI();
  });

})();
