(function(){

  var issetParam = function(a){
    return (void 0===a || null===a) ? false : true;
  };

  // simple toggler to add/remove a class that uses CSS3 transition to show/hide an element
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

    // I'm not using jQuery so the $ represents element IDs 
    $loading = document.getElementById('loading');
    $status = document.getElementById('status');
    $un = document.getElementById('un');
    $pw = document.getElementById('pw');
    $add = document.getElementById('add');

    var Sheet = new GoogleSpreadsheet();

    /*
      This is the function that sends info to the contentscript.js
      contentscripts is how a Chrome extensions interact with a website
    */
    var sendDetails = function(un,pw){
      chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {password: pw,username: un}, function(response) {
          console.log(response.dom);
        });
      });
    };

    /*
      Searches through the spreadsheet data for the matching domain
      returns array [username,password]
    */
    var findPW = function(data,tabDomain) {
      var _data = data || {};
      if (issetParam(_data) && typeof _data === 'object') {
        for (var prop in _data) {
          if (tabDomain.indexOf(_data[prop].site) !== -1) {
            var result = [];
            result.push(_data[prop].u,_data[prop].pw);
            return result;
          }
        }
      } else {
        console.warn('findPW: data not an object');
      }
    };

    /*
      Strips out a domain's hostname from a URL string
    */
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

    /*
      Updates the status element ID and displays it
    */
    var handleStatus = function(status,message) {
      var stat = status || '';
      var msg = message || '';
      if (stat !== '' && msg !== '') {
        $status.textContent = msg;
        $status.className = stat;
        $status.style.display = "block";
      }
    };

    var onSuccess = function(result){
      $loading.style.display = "none";
      handleStatus('success','password found');
      $un.textContent = result[0];
      $pw.textContent = result[1];
      sendDetails(result[0],result[1]);
    };

    var pwNotFound = function(){
      $loading.style.display = "none";
      handleStatus('error','password not found');
      // show add new password message and display the form
    };

    var bindAdd = function(){
      $add.addEventListener('click', function(evt) {
        Sheet.add(function(result){
          if (result.success === false){
            handleStatus('error',result.message);
          } else {
            handleStatus('success', result.message);
          }
        });
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
        });

        Sheet.load(function(result){
          var found = findPW(result.sheetData,activeUrl);
          if (typeof found === 'undefined') {
            pwNotFound();
          } else {
            onSuccess(found);
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
      return; // deal with DOMContentLoaded being fired twice for some reason
    }
    this.bDone = true;
    generate.init();
    access.init();
    initUI();
  });

})();
