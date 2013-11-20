(function(){

  var bgPage = chrome.extension.getBackgroundPage();

  var issetParam = function(a){
    return (void 0===a || null===a) ? false : true;
  };

  var accessSheet = (function() {

    var sheet = new GoogleSpreadsheet();

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

    var loadData = function(){
      sheet.load(); //saves results to localStorage["sheetData"] or error to localStorage['error']
      if (localStorage['error']) {
        handleError(localStorage['error']);
        return;
      }
      var data = JSON.parse(localStorage["sheetData"]);
      return data;
    };

    var handleError = function(err){
      if (issetParam(err)){
        var error = document.getElementById('error');
        error.textContent = err;
        error.style.display = 'block';
        if (typeof localStorage['error'] !== 'undefined'){
          localStorage.removeItem('error');
        }
      }
    };

    var updateUI = function(result){
      if (issetParam(result)){
        document.getElementById('un').textContent = result[0];
        document.getElementById('pw').textContent = result[1];
      } else {
        console.warn('updateUI: results are null');
      }
    };

    var bindAdd = function(){
      add = document.getElementById('add');
      add.addEventListener('click', function(evt) {
        sheet.add();
        var error = localStorage['error'];
        if (typeof error !== 'undefined'){
          handleError(error);
        }
      },false);
    };

    var init = function() {
      bindAdd();
      var spreadSheetData = loadData();
      chrome.tabs.query({
          active: true,
          lastFocusedWindow: true
      }, function(tabs) {
        var tab = tabs[0];
        var activeUrl = getDomain(tab.url);
        sheet.setTabUrl(activeUrl);
        var found = findPW(spreadSheetData,activeUrl);
        if (typeof found === 'undefined') {
          handleError('password not found');
        } else {
          updateUI(found);
        }
        localStorage.removeItem('sheetData');
      });

    };

    return {
      init: init
    };
  });


  var GoogleSpreadsheet = (function(){
    function GoogleSpreadsheet() {
      this.sourceIdentifier = localStorage["sheet_url"];
      if (this.sourceIdentifier.match(/http(s)*:/)) {
        this.url = this.sourceIdentifier;
        try {
          this.key = this.url.match(/key=(.*?)(&|#)/)[1];
        } catch (error) {
          this.key = this.url.match(/(cells|list)\/(.*?)\//)[2];
        }
      } else {
        this.key = this.sourceIdentifier;
      }
      this.jsonListUrl = "https://spreadsheets.google.com/feeds/list/" + this.key + '/od6/private/full';
      this.jsonCellsUrl = "https://spreadsheets.google.com/feeds/cells/" + this.key + '/od6/private/basic';
      this.tabUrl = "";
    }

    GoogleSpreadsheet.prototype.load = function() {
      var params = {
        'headers': {
          'GData-Version': '3.0'
        },
        'parameters': {
          'alt': 'json',
          'showfolders': 'true'
        }
      };
      var url = this.jsonListUrl;
      bgPage.oauth.sendSignedRequest(url, GoogleSpreadsheet.processLoad, params);
    };

    GoogleSpreadsheet.prototype.setTabUrl = function(tabUrl) {
      this.tabUrl = tabUrl || "";
      localStorage['tabUrl'] = tabUrl || "";
    };

    GoogleSpreadsheet.constructSpreadAtomXml_ = function() {
      var un = document.getElementById('un').textContent;
      var pw = document.getElementById('pw').textContent;
      var atomXML = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n' +
          '<gsx:site>'+localStorage['tabUrl']+'</gsx:site>\n' +
          '<gsx:username>'+un+'</gsx:username>\n' +
          '<gsx:password>'+pw+'</gsx:password>\n' +
          '</entry>';
      return atomXML;
    };

    GoogleSpreadsheet.prototype.add = function(data){
      var params = {
        'method': 'POST',
        'headers': {
          'GData-Version': '3.0',
          'Content-Type': 'application/atom+xml'
        },
        'body': GoogleSpreadsheet.constructSpreadAtomXml_()
      };

      var url = this.jsonListUrl;
      bgPage.oauth.sendSignedRequest(url, GoogleSpreadsheet.processAdd, params);
    };

    GoogleSpreadsheet.processAdd = function(response,xhr){
      if (xhr.status !== 201) {
        localStorage['error'] = xhr.status + ': error saving';
      } else {
        document.getElementById('error').style.display = "none";
        document.getElementById('success').style.display = "block";
      }
      console.log(xhr);
    };

    GoogleSpreadsheet.processLoad = function(response,xhr){
      if (xhr.status !== 200) {
        console.log(xhr.status + ": Connection Failed");
        localStorage['error'] = "Connection failed";
        return false;
      }
      var data = JSON.parse(response);
      var _i = 0,
          _results = {},
          _entries = data.feed.entry;
      for (prop in _entries) {
        _results[_i] = {
            site : _entries[prop].gsx$site.$t,
            pw : _entries[prop].gsx$password.$t,
            u : _entries[prop].gsx$username.$t
        }
        _i++;
      }
      localStorage["sheetData"] = JSON.stringify(_results);
    };

    return GoogleSpreadsheet;
  })();


  var access = new accessSheet();
  access.init();

})();